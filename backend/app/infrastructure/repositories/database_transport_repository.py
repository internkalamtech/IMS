"""
Database-backed implementation of TransportRepository.

This module implements the TransportRepository interface using PostgreSQL
with SQLAlchemy ORM.

Following Clean Architecture principles:
- Implements domain repository interface
- Uses infrastructure layer (database models)
- Handles data mapping between database models and domain entities
- Proper error handling and logging
"""

from typing import List, Optional
from sqlalchemy import select, func, and_, or_, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.errors import DatabaseError, NotFoundError
from app.core.logger import Logger
from app.domain.entities.transport import (
    Student,
    Vehicle,
    Route,
    Stop,
    StudentRouteAllocation,
    RouteSummary,
)
from app.domain.repositories.transport_repository import TransportRepository
from app.infrastructure.database.models import (
    StudentModel,
    VehicleModel,
    RouteModel,
    StopModel,
    StudentRouteAllocationModel,
)


class DatabaseTransportRepository(TransportRepository):
    """
    Database-backed implementation of TransportRepository.

    Uses PostgreSQL with SQLAlchemy for data persistence.
    """

    def __init__(self, db: AsyncSession):
        """
        Initialize repository with database session.

        Args:
            db: SQLAlchemy async session
        """
        self.db = db

    async def get_students(
        self,
        search_query: Optional[str] = None,
        class_filter: Optional[str] = None,
        route_stop_filter: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Student]:
        """
        Get students with optional filtering.

        Args:
            search_query: Search by student name
            class_filter: Filter by class name
            route_stop_filter: Filter by assigned route stop
            limit: Maximum number of results
            offset: Number of results to skip

        Returns:
            List of Student entities
        """
        try:
            # Build base query with user join
            query = select(StudentModel).options(joinedload(StudentModel.user))

            # Apply filters
            if search_query:
                query = query.where(
                    StudentModel.user.has(
                        func.lower(func.concat(StudentModel.user.name)).like(
                            f"%{search_query.lower()}%"
                        )
                    )
                )

            if class_filter:
                query = query.where(StudentModel.class_name == class_filter)

            if route_stop_filter:
                query = query.where(
                    StudentModel.allocations.any(
                        and_(
                            StudentRouteAllocationModel.is_active == True,
                            StudentRouteAllocationModel.stop.has(
                                StopModel.name.ilike(f"%{route_stop_filter}%")
                            ),
                        )
                    )
                )

            # Apply pagination
            query = query.limit(limit).offset(offset)

            result = await self.db.execute(query)
            student_models = result.unique().scalars().all()

            return [self._student_to_domain_entity(student) for student in student_models]

        except Exception as e:
            Logger.error(f"Database error getting students: {e}", exc_info=True)
            raise DatabaseError(f"Failed to get students: {str(e)}")

    async def get_student_by_id(self, student_id: str) -> Optional[Student]:
        """
        Get a student by ID.

        Args:
            student_id: Student ID

        Returns:
            Student entity if found, None otherwise
        """
        try:
            result = await self.db.execute(
                select(StudentModel)
                .options(joinedload(StudentModel.user))
                .where(StudentModel.id == int(student_id))
            )
            student_model = result.unique().scalar_one_or_none()

            if not student_model:
                return None

            return self._student_to_domain_entity(student_model)

        except Exception as e:
            Logger.error(f"Database error getting student: {e}", exc_info=True)
            raise DatabaseError(f"Failed to get student: {str(e)}")

    async def get_student_allocations(self, student_id: str) -> List[StudentRouteAllocation]:
        """
        Get all route allocations for a student.

        Args:
            student_id: Student ID

        Returns:
            List of StudentRouteAllocation entities
        """
        try:
            result = await self.db.execute(
                select(StudentRouteAllocationModel)
                .options(
                    joinedload(StudentRouteAllocationModel.route),
                    joinedload(StudentRouteAllocationModel.stop),
                )
                .where(
                    and_(
                        StudentRouteAllocationModel.student_id == int(student_id),
                        StudentRouteAllocationModel.is_active == True,
                    )
                )
            )
            allocation_models = result.unique().scalars().all()

            return [self._allocation_to_domain_entity(allocation) for allocation in allocation_models]

        except Exception as e:
            Logger.error(f"Database error getting student allocations: {e}", exc_info=True)
            raise DatabaseError(f"Failed to get student allocations: {str(e)}")

    async def get_allocations(
        self,
        route_id: Optional[str] = None,
        student_id: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[StudentRouteAllocation]:
        """
        Get all student route allocations with optional filtering.

        Args:
            route_id: Filter by route ID (optional)
            student_id: Filter by student ID (optional)
            limit: Maximum number of results
            offset: Number of results to skip

        Returns:
            List of StudentRouteAllocation entities
        """
        try:
            query = select(StudentRouteAllocationModel).options(
                joinedload(StudentRouteAllocationModel.student),
                joinedload(StudentRouteAllocationModel.route),
                joinedload(StudentRouteAllocationModel.stop),
            )

            # Apply filters
            conditions = [StudentRouteAllocationModel.is_active == True]
            if route_id:
                conditions.append(StudentRouteAllocationModel.route_id == int(route_id))
            if student_id:
                conditions.append(StudentRouteAllocationModel.student_id == int(student_id))

            query = query.where(and_(*conditions)).limit(limit).offset(offset)

            result = await self.db.execute(query)
            allocation_models = result.unique().scalars().all()

            return [self._allocation_to_domain_entity(allocation) for allocation in allocation_models]

        except Exception as e:
            Logger.error(f"Database error getting allocations: {e}", exc_info=True)
            raise DatabaseError(f"Failed to get allocations: {str(e)}")

    async def assign_student_to_route(
        self,
        student_id: str,
        route_id: str,
        stop_id: str,
        allocation_type: str = "both",
    ) -> StudentRouteAllocation:
        """
        Assign a student to a route stop.

        Args:
            student_id: Student ID
            route_id: Route ID
            stop_id: Stop ID
            allocation_type: Type of allocation ('pickup', 'dropoff', 'both')

        Returns:
            Created StudentRouteAllocation entity
        """
        try:
            # Create new allocation
            allocation_model = StudentRouteAllocationModel(
                student_id=int(student_id),
                route_id=int(route_id),
                stop_id=int(stop_id),
                allocation_type=allocation_type,
                is_active=True,
            )

            self.db.add(allocation_model)
            await self.db.commit()
            await self.db.refresh(allocation_model)

            # Load relationships for domain entity conversion
            result = await self.db.execute(
                select(StudentRouteAllocationModel)
                .options(
                    joinedload(StudentRouteAllocationModel.route),
                    joinedload(StudentRouteAllocationModel.stop),
                )
                .where(StudentRouteAllocationModel.id == allocation_model.id)
            )
            allocation_with_relations = result.unique().scalar_one()

            Logger.info(f"Assigned student {student_id} to route {route_id}, stop {stop_id}")
            return self._allocation_to_domain_entity(allocation_with_relations)

        except Exception as e:
            await self.db.rollback()
            Logger.error(f"Database error assigning student to route: {e}", exc_info=True)
            raise DatabaseError(f"Failed to assign student to route: {str(e)}")

    async def update_student_allocation(
        self,
        allocation_id: str,
        route_id: Optional[str] = None,
        stop_id: Optional[str] = None,
        allocation_type: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> Optional[StudentRouteAllocation]:
        """
        Update a student's route allocation.

        Args:
            allocation_id: Allocation ID
            route_id: New route ID (optional)
            stop_id: New stop ID (optional)
            allocation_type: New allocation type (optional)
            is_active: New active status (optional)

        Returns:
            Updated StudentRouteAllocation entity if found, None otherwise
        """
        try:
            result = await self.db.execute(
                select(StudentRouteAllocationModel).where(
                    StudentRouteAllocationModel.id == int(allocation_id)
                )
            )
            allocation_model = result.scalar_one_or_none()

            if not allocation_model:
                return None

            # Update fields
            if route_id is not None:
                allocation_model.route_id = int(route_id)
            if stop_id is not None:
                allocation_model.stop_id = int(stop_id)
            if allocation_type is not None:
                allocation_model.allocation_type = allocation_type
            if is_active is not None:
                allocation_model.is_active = is_active

            await self.db.commit()
            await self.db.refresh(allocation_model)

            # Load relationships for domain entity conversion
            result = await self.db.execute(
                select(StudentRouteAllocationModel)
                .options(
                    joinedload(StudentRouteAllocationModel.route),
                    joinedload(StudentRouteAllocationModel.stop),
                )
                .where(StudentRouteAllocationModel.id == allocation_model.id)
            )
            allocation_with_relations = result.unique().scalar_one()

            Logger.info(f"Updated allocation {allocation_id}")
            return self._allocation_to_domain_entity(allocation_with_relations)

        except Exception as e:
            await self.db.rollback()
            Logger.error(f"Database error updating student allocation: {e}", exc_info=True)
            raise DatabaseError(f"Failed to update student allocation: {str(e)}")

    async def remove_student_allocation(self, allocation_id: str) -> bool:
        """
        Remove a student's route allocation.

        Args:
            allocation_id: Allocation ID

        Returns:
            True if allocation was removed, False if not found
        """
        try:
            result = await self.db.execute(
                select(StudentRouteAllocationModel).where(
                    StudentRouteAllocationModel.id == int(allocation_id)
                )
            )
            allocation_model = result.scalar_one_or_none()

            if not allocation_model:
                return False

            await self.db.delete(allocation_model)
            await self.db.commit()

            Logger.info(f"Removed allocation {allocation_id}")
            return True

        except Exception as e:
            await self.db.rollback()
            Logger.error(f"Database error removing student allocation: {e}", exc_info=True)
            raise DatabaseError(f"Failed to remove student allocation: {str(e)}")

    async def get_route_summaries(self) -> List[RouteSummary]:
        """
        Get summary of all routes with student counts and capacity.

        Returns:
            List of RouteSummary entities
        """
        try:
            # Query to get routes with student counts and vehicle capacity
            query = select(
                RouteModel.id,
                RouteModel.name,
                func.count(StudentRouteAllocationModel.id).label("student_count"),
                VehicleModel.capacity.label("vehicle_capacity"),
            ).outerjoin(
                VehicleModel, RouteModel.vehicle_id == VehicleModel.id
            ).outerjoin(
                StudentRouteAllocationModel,
                and_(
                    StudentRouteAllocationModel.route_id == RouteModel.id,
                    StudentRouteAllocationModel.is_active == True,
                ),
            ).where(RouteModel.is_active == True).group_by(
                RouteModel.id, RouteModel.name, VehicleModel.capacity
            )

            result = await self.db.execute(query)
            rows = result.all()

            summaries = []
            for row in rows:
                utilization_percentage = 0.0
                if row.vehicle_capacity and row.vehicle_capacity > 0:
                    utilization_percentage = (row.student_count / row.vehicle_capacity) * 100

                summaries.append(
                    RouteSummary(
                        route_id=str(row.id),
                        route_name=row.name,
                        vehicle_capacity=row.vehicle_capacity,
                        student_count=row.student_count,
                        utilization_percentage=utilization_percentage,
                    )
                )

            return summaries

        except Exception as e:
            Logger.error(f"Database error getting route summaries: {e}", exc_info=True)
            raise DatabaseError(f"Failed to get route summaries: {str(e)}")

    async def get_routes(self) -> List[Route]:
        """
        Get all routes.

        Returns:
            List of Route entities
        """
        try:
            result = await self.db.execute(
                select(RouteModel).where(RouteModel.is_active == True)
            )
            route_models = result.scalars().all()

            return [self._route_to_domain_entity(route) for route in route_models]

        except Exception as e:
            Logger.error(f"Database error getting routes: {e}", exc_info=True)
            raise DatabaseError(f"Failed to get routes: {str(e)}")

    async def get_route_by_id(self, route_id: str) -> Optional[Route]:
        """
        Get a route by ID.

        Args:
            route_id: Route ID

        Returns:
            Route entity if found, None otherwise
        """
        try:
            result = await self.db.execute(
                select(RouteModel).where(
                    and_(
                        RouteModel.id == int(route_id),
                        RouteModel.is_active == True,
                    )
                )
            )
            route_model = result.scalar_one_or_none()

            if not route_model:
                return None

            return self._route_to_domain_entity(route_model)

        except Exception as e:
            Logger.error(f"Database error getting route: {e}", exc_info=True)
            raise DatabaseError(f"Failed to get route: {str(e)}")

    async def get_stops_by_route(self, route_id: str) -> List[Stop]:
        """
        Get all stops for a route.

        Args:
            route_id: Route ID

        Returns:
            List of Stop entities
        """
        try:
            result = await self.db.execute(
                select(StopModel).where(StopModel.route_id == int(route_id)).order_by(
                    StopModel.sequence_order
                )
            )
            stop_models = result.scalars().all()

            return [self._stop_to_domain_entity(stop) for stop in stop_models]

        except Exception as e:
            Logger.error(f"Database error getting stops by route: {e}", exc_info=True)
            raise DatabaseError(f"Failed to get stops by route: {str(e)}")

    def _student_to_domain_entity(self, student_model: StudentModel) -> Student:
        """Convert StudentModel to Student domain entity."""
        return Student(
            id=str(student_model.id),
            name=student_model.user.name,
            class_name=student_model.class_name,
            roll_number=student_model.roll_number,
            parent_contact=student_model.parent_contact,
        )

    def _route_to_domain_entity(self, route_model: RouteModel) -> Route:
        """Convert RouteModel to Route domain entity."""
        return Route(
            id=str(route_model.id),
            name=route_model.name,
            description=route_model.description,
            vehicle_id=str(route_model.vehicle_id) if route_model.vehicle_id else None,
            is_active=route_model.is_active,
        )

    def _stop_to_domain_entity(self, stop_model: StopModel) -> Stop:
        """Convert StopModel to Stop domain entity."""
        return Stop(
            id=str(stop_model.id),
            route_id=str(stop_model.route_id),
            name=stop_model.name,
            latitude=stop_model.latitude,
            longitude=stop_model.longitude,
            pickup_time=stop_model.pickup_time,
            dropoff_time=stop_model.dropoff_time,
            sequence_order=stop_model.sequence_order,
        )

    def _allocation_to_domain_entity(
        self, allocation_model: StudentRouteAllocationModel
    ) -> StudentRouteAllocation:
        """Convert StudentRouteAllocationModel to StudentRouteAllocation domain entity."""
        return StudentRouteAllocation(
            id=str(allocation_model.id),
            student_id=str(allocation_model.student_id),
            route_id=str(allocation_model.route_id),
            stop_id=str(allocation_model.stop_id),
            allocation_type=allocation_model.allocation_type,
            is_active=allocation_model.is_active,
        )
