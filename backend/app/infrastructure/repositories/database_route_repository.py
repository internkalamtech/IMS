"""
Database-backed implementation of RouteRepository.

Implements the RouteRepository interface using SQLAlchemy ORM with an
async PostgreSQL session.  This is the ONLY file in the codebase
allowed to import SQLAlchemy or know about the ORM models for routes.

Key design decisions
--------------------
1. selectinload for stops
   We use ``selectinload`` (two separate SELECT statements) rather than
   a JOIN when fetching a route with its stops.  This avoids duplicate
   Route columns that JOINs produce for one-to-many relationships and
   is recommended by SQLAlchemy for collections.

2. Replace-all stop update strategy
   On PUT (update_route with new stops): all old RouteStopModel rows
   for the route are deleted and the new list is inserted.  Diffing
   (detecting which stops changed) is fragile and complex.  Replace-all
   is idempotent — calling it twice with the same stops produces the
   same result.

3. Cascade delete at DB level
   The FK constraint on route_stops.route_id has ondelete=\"CASCADE\",
   so deleting a RouteModel row removes all its RouteStopModel children
   at the PostgreSQL level — not in Python code.  Same for
   student_route_mappings.
"""

from typing import List, Optional

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import DatabaseError
from app.core.logger import Logger
from app.domain.entities.route import Route, RouteStop, StudentRouteMapping
from app.domain.repositories.route_repository import RouteRepository
from app.infrastructure.database.models import (
    RouteModel,
    RouteStopModel,
    StudentRouteMappingModel,
)


class DatabaseRouteRepository(RouteRepository):
    """
    PostgreSQL-backed implementation of RouteRepository.

    All public methods delegate to async SQLAlchemy queries.  Every
    database model object is mapped to a domain entity before returning
    so the rest of the application never sees SQLAlchemy internals.
    """

    def __init__(self, db: AsyncSession) -> None:
        """
        Args:
            db: SQLAlchemy async session (injected via FastAPI Depends).
        """
        self.db = db

    # ------------------------------------------------------------------ #
    # Internal helpers — ORM model → domain entity mappers
    # ------------------------------------------------------------------ #

    @staticmethod
    def _stop_to_entity(model: RouteStopModel) -> RouteStop:
        """Map a RouteStopModel ORM object to a RouteStop domain entity."""
        return RouteStop(
            id=model.id,
            route_id=model.route_id,
            name=model.name,
            latitude=model.latitude,
            longitude=model.longitude,
            sequence_order=model.sequence_order,
            arrival_time=model.arrival_time,
            created_at=model.created_at,
        )

    @staticmethod
    def _route_to_entity(model: RouteModel) -> Route:
        """
        Map a RouteModel ORM object (with loaded stops) to a Route entity.

        The stops list is sorted by sequence_order so callers always
        receive stops in travel order, regardless of insertion order.
        """
        stops = sorted(
            [
                DatabaseRouteRepository._stop_to_entity(s)
                for s in (model.stops or [])
            ],
            key=lambda s: s.sequence_order,
        )
        return Route(
            id=model.id,
            name=model.name,
            branch_id=model.branch_id,
            organization_id=model.organization_id,
            description=model.description,
            is_active=model.is_active,
            stops=stops,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    @staticmethod
    def _mapping_to_entity(
        model: StudentRouteMappingModel,
    ) -> StudentRouteMapping:
        """Map a StudentRouteMappingModel to a StudentRouteMapping entity."""
        return StudentRouteMapping(
            id=model.id,
            route_id=model.route_id,
            student_id=model.student_id,
            pickup_stop_id=model.pickup_stop_id,
            created_at=model.created_at,
        )

    # ------------------------------------------------------------------ #
    # Route CRUD
    # ------------------------------------------------------------------ #

    async def create_route(
        self,
        name: str,
        branch_id: str,
        stops: List[dict],
        organization_id: Optional[str] = None,
        description: Optional[str] = None,
        is_active: bool = True,
    ) -> Route:
        """
        Persist a new route and its stops in a single transaction.

        Stops are inserted in the order supplied; sequence_order values
        are taken from each stop dict rather than being auto-assigned so
        the caller retains full control over travel order.

        Args:
            name:            Route display name.
            branch_id:       Branch identifier string.
            stops:           List of stop dicts (name, latitude,
                             longitude, sequence_order, arrival_time).
            organization_id: Optional org identifier string.
            description:     Optional free-text description.
            is_active:       Initial active state.

        Returns:
            Newly created Route entity with all DB-assigned IDs.
        """
        try:
            route_model = RouteModel(
                name=name,
                branch_id=branch_id,
                organization_id=organization_id,
                description=description,
                is_active=is_active,
            )
            self.db.add(route_model)
            # flush assigns the route PK so stop FK can reference it
            await self.db.flush()

            for stop_data in stops:
                stop_model = RouteStopModel(
                    route_id=route_model.id,
                    name=stop_data["name"],
                    latitude=stop_data["latitude"],
                    longitude=stop_data["longitude"],
                    sequence_order=stop_data["sequence_order"],
                    arrival_time=stop_data.get("arrival_time"),
                )
                self.db.add(stop_model)

            await self.db.flush()
            # Refresh to load the stops relationship that was just inserted
            await self.db.refresh(route_model, attribute_names=["stops"])

            Logger.info(
                f"Route created: id={route_model.id}, name='{name}', "
                f"branch='{branch_id}', stops={len(stops)}"
            )
            return self._route_to_entity(route_model)
        except Exception as exc:
            Logger.error(f"Error creating route: {exc}")
            raise DatabaseError("Failed to create route.") from exc

    async def update_route(
        self,
        route_id: int,
        name: Optional[str] = None,
        branch_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        description: Optional[str] = None,
        is_active: Optional[bool] = None,
        stops: Optional[List[dict]] = None,
    ) -> Route:
        """
        Update scalar fields and/or replace stops for an existing route.

        Replace-all strategy for stops
        -------------------------------
        When ``stops`` is provided:
        1. All existing RouteStopModel rows for this route are deleted.
        2. The new stop list is inserted.
        This is atomic within the session's transaction (commit happens
        in the FastAPI DB session middleware after the endpoint returns).

        Args:
            route_id: PK of the route to update.
            (other args): see RouteRepository.update_route docstring.

        Returns:
            Updated Route entity.
        """
        try:
            result = await self.db.execute(
                select(RouteModel)
                .where(RouteModel.id == route_id)
                .options(selectinload(RouteModel.stops))
            )
            model = result.scalar_one_or_none()
            if model is None:
                raise DatabaseError(
                    f"Route with id {route_id} not found during update."
                )

            # Apply scalar field updates only when explicitly provided
            if name is not None:
                model.name = name
            if branch_id is not None:
                model.branch_id = branch_id
            # organization_id can be set to None intentionally
            if organization_id is not None:
                model.organization_id = organization_id
            if description is not None:
                model.description = description
            if is_active is not None:
                model.is_active = is_active

            # Replace stops if a new list was supplied
            if stops is not None:
                # Delete existing stops (DB cascade would handle this on
                # route delete, but here we want a targeted stop-only delete)
                await self.db.execute(
                    delete(RouteStopModel).where(
                        RouteStopModel.route_id == route_id
                    )
                )
                for stop_data in stops:
                    stop_model = RouteStopModel(
                        route_id=route_id,
                        name=stop_data["name"],
                        latitude=stop_data["latitude"],
                        longitude=stop_data["longitude"],
                        sequence_order=stop_data["sequence_order"],
                        arrival_time=stop_data.get("arrival_time"),
                    )
                    self.db.add(stop_model)

            await self.db.flush()
            await self.db.refresh(model, attribute_names=["stops"])

            Logger.info(f"Route updated: id={route_id}")
            return self._route_to_entity(model)
        except DatabaseError:
            raise
        except Exception as exc:
            Logger.error(f"Error updating route {route_id}: {exc}")
            raise DatabaseError("Failed to update route.") from exc

    async def get_route_by_id(self, route_id: int) -> Optional[Route]:
        """
        Fetch a route and its stops by primary key.

        Uses selectinload so stops are loaded with one extra SELECT
        (no cartesian product from a JOIN).

        Args:
            route_id: PK to look up.

        Returns:
            Route entity or None if not found.
        """
        try:
            result = await self.db.execute(
                select(RouteModel)
                .where(RouteModel.id == route_id)
                .options(selectinload(RouteModel.stops))
            )
            model = result.scalar_one_or_none()
            return self._route_to_entity(model) if model else None
        except Exception as exc:
            Logger.error(f"Error fetching route {route_id}: {exc}")
            raise DatabaseError("Failed to retrieve route.") from exc

    async def list_routes(
        self,
        branch_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> List[Route]:
        """
        List routes with optional branch/org/active filters.

        The branch_id and organization_id columns are indexed in the
        DB so these WHERE clauses are index seeks, not full scans —
        this is what \"optimized route lists\" in the AC means.

        Args:
            branch_id:       Exact branch_id to match (None = skip).
            organization_id: Exact org_id to match (None = skip).
            is_active:       Boolean flag filter (None = skip).

        Returns:
            List of Route entities with sorted stops.
        """
        try:
            query = select(RouteModel).options(
                selectinload(RouteModel.stops)
            )
            if branch_id is not None:
                query = query.where(RouteModel.branch_id == branch_id)
            if organization_id is not None:
                query = query.where(
                    RouteModel.organization_id == organization_id
                )
            if is_active is not None:
                query = query.where(RouteModel.is_active == is_active)

            result = await self.db.execute(query)
            return [
                self._route_to_entity(m) for m in result.scalars().all()
            ]
        except Exception as exc:
            Logger.error(f"Error listing routes: {exc}")
            raise DatabaseError("Failed to list routes.") from exc

    async def delete_route(self, route_id: int) -> bool:
        """
        Delete a route row.

        PostgreSQL's ondelete=\"CASCADE\" on route_stops and
        student_route_mappings ensures child rows are removed at the
        DB level when the parent route row is deleted.

        Args:
            route_id: PK of the route.

        Returns:
            True if found and deleted, False if not found.
        """
        try:
            result = await self.db.execute(
                select(RouteModel).where(RouteModel.id == route_id)
            )
            model = result.scalar_one_or_none()
            if model is None:
                return False
            await self.db.delete(model)
            await self.db.flush()
            Logger.info(f"Route deleted: id={route_id}")
            return True
        except Exception as exc:
            Logger.error(f"Error deleting route {route_id}: {exc}")
            raise DatabaseError("Failed to delete route.") from exc

    # ------------------------------------------------------------------ #
    # Student mapping operations
    # ------------------------------------------------------------------ #

    async def add_student_mapping(
        self,
        route_id: int,
        student_id: int,
        pickup_stop_id: Optional[int] = None,
    ) -> StudentRouteMapping:
        """
        Persist a student-to-route mapping record.

        Args:
            route_id:       PK of the route.
            student_id:     PK of the student.
            pickup_stop_id: Optional boarding stop PK.

        Returns:
            Created StudentRouteMapping entity.
        """
        try:
            mapping = StudentRouteMappingModel(
                route_id=route_id,
                student_id=student_id,
                pickup_stop_id=pickup_stop_id,
            )
            self.db.add(mapping)
            await self.db.flush()
            await self.db.refresh(mapping)
            Logger.info(
                f"Student {student_id} mapped to route {route_id}"
            )
            return self._mapping_to_entity(mapping)
        except Exception as exc:
            Logger.error(
                f"Error adding student {student_id} to route {route_id}: {exc}"
            )
            raise DatabaseError("Failed to add student to route.") from exc

    async def remove_student_mappings(self, route_id: int) -> None:
        """
        Explicitly delete all student mappings for a route.

        In production Postgres this is handled by the CASCADE FK, but
        calling this explicitly is useful in tests (e.g. SQLite which
        may not enforce FK cascades by default).

        Args:
            route_id: PK of the route.
        """
        try:
            await self.db.execute(
                delete(StudentRouteMappingModel).where(
                    StudentRouteMappingModel.route_id == route_id
                )
            )
            await self.db.flush()
        except Exception as exc:
            Logger.error(
                f"Error removing student mappings for route {route_id}: {exc}"
            )
            raise DatabaseError(
                "Failed to remove student mappings."
            ) from exc

    async def route_exists(self, route_id: int) -> bool:
        """
        Lightweight existence check (SELECT id only, no entity mapping).

        Args:
            route_id: PK to check.

        Returns:
            True if the route exists.
        """
        try:
            result = await self.db.execute(
                select(RouteModel.id).where(RouteModel.id == route_id)
            )
            return result.scalar_one_or_none() is not None
        except Exception as exc:
            Logger.error(
                f"Error checking route existence {route_id}: {exc}"
            )
            raise DatabaseError(
                "Failed to check route existence."
            ) from exc
