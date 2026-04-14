"""
Abstract repository interface for route operations.

Defines the contract that ALL concrete route repository implementations
must fulfill.  Use cases depend only on this abstract class — never on
SQLAlchemy or any other infrastructure detail.

Dependency Inversion Principle (the D in SOLID)
------------------------------------------------
High-level modules (use cases) must not depend on low-level modules
(database).  Both should depend on abstractions (this interface).
If the database ever changes (Postgres → MongoDB), only the concrete
implementation in ``infrastructure/repositories/`` needs to change;
the use cases and API layer remain untouched.
"""

from abc import ABC, abstractmethod
from typing import List, Optional

from app.domain.entities.route import Route, RouteStop, StudentRouteMapping


class RouteRepository(ABC):
    """
    Abstract repository for transport route operations.

    Concrete implementations live in the infrastructure layer:
        app/infrastructure/repositories/database_route_repository.py
    """

    # ------------------------------------------------------------------ #
    # Route CRUD
    # ------------------------------------------------------------------ #

    @abstractmethod
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
        Persist a new route with its stops in a single transaction.

        ``stops`` is a list of dicts with keys:
            name, latitude, longitude, sequence_order, arrival_time

        Args:
            name:            Route name.
            branch_id:       Branch identifier string.
            stops:           Ordered list of stop data dicts.
            organization_id: Optional organization identifier.
            description:     Optional free-text description.
            is_active:       Whether the route starts active.

        Returns:
            Fully populated Route entity (including stop IDs from DB).
        """
        ...

    @abstractmethod
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
        Update an existing route.  If ``stops`` is provided, the old
        stops are REPLACED entirely (delete-then-insert) so the caller
        always supplies the complete intended stop list.

        Args:
            route_id:        PK of the route to update.
            name:            New route name (unchanged if None).
            branch_id:       New branch ID (unchanged if None).
            organization_id: New org ID (unchanged if None).
            description:     New description (unchanged if None).
            is_active:       New active flag (unchanged if None).
            stops:           Replacement stop list.  If None, stops are
                             NOT modified.

        Returns:
            Updated Route entity.
        """
        ...

    @abstractmethod
    async def get_route_by_id(self, route_id: int) -> Optional[Route]:
        """
        Retrieve a single route (with its stops) by primary key.

        Args:
            route_id: PK of the route.

        Returns:
            Route entity or None if not found.
        """
        ...

    @abstractmethod
    async def list_routes(
        self,
        branch_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> List[Route]:
        """
        List routes with optional filters.

        The GET /routes endpoint exposes these as query parameters so
        the mobile app (or admin panel) can fetch only the routes that
        belong to a specific branch or organisation.

        Args:
            branch_id:       Filter by branch identifier string.
            organization_id: Filter by org identifier string.
            is_active:       If True/False, filter by active status.
                             If None, return both active and inactive.

        Returns:
            List of Route entities (each with its stops populated).
        """
        ...

    @abstractmethod
    async def delete_route(self, route_id: int) -> bool:
        """
        Delete a route and ALL associated data.

        The DB-level cascade on ``route_stops`` and
        ``student_route_mappings`` means the infra layer only needs to
        delete the parent RouteModel row; child rows are removed by
        PostgreSQL automatically.  This satisfies the acceptance
        criterion: "DELETE: Clean up route records and associated
        student mappings."

        Args:
            route_id: PK of the route to delete.

        Returns:
            True if the route existed and was deleted, False otherwise.
        """
        ...

    # ------------------------------------------------------------------ #
    # Student mapping operations
    # ------------------------------------------------------------------ #

    @abstractmethod
    async def add_student_mapping(
        self,
        route_id: int,
        student_id: int,
        pickup_stop_id: Optional[int] = None,
    ) -> StudentRouteMapping:
        """
        Assign a student to a route (optionally at a specific stop).

        Args:
            route_id:       PK of the route.
            student_id:     PK of the student.
            pickup_stop_id: PK of the boarding stop (optional).

        Returns:
            Created StudentRouteMapping entity.
        """
        ...

    @abstractmethod
    async def remove_student_mappings(self, route_id: int) -> None:
        """
        Remove ALL student mappings for a route.

        Called explicitly before route deletion when the DB cascade
        is not guaranteed (e.g. in test environments using SQLite).
        In production Postgres the cascade handles this automatically.

        Args:
            route_id: PK of the route whose mappings should be removed.
        """
        ...

    @abstractmethod
    async def route_exists(self, route_id: int) -> bool:
        """
        Lightweight check for route existence (avoids full entity load).

        Args:
            route_id: PK to check.

        Returns:
            True if a route with this ID exists.
        """
        ...
