"""
Use cases for transport management business logic.

Use cases encapsulate business rules and orchestrate the flow of data
between entities and repositories.
"""

from typing import List, Optional
from app.domain.entities.transport import (
    Student,
    StudentRouteAllocation,
    RouteSummary,
)
from app.domain.repositories.transport_repository import TransportRepository


class GetStudentsUseCase:
    """
    Use case for retrieving students with filtering.
    """

    def __init__(self, transport_repository: TransportRepository):
        self.transport_repository = transport_repository

    async def execute(
        self,
        search_query: Optional[str] = None,
        class_filter: Optional[str] = None,
        route_stop_filter: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Student]:
        """
        Execute the get students use case.

        Args:
            search_query: Search by student name
            class_filter: Filter by class name
            route_stop_filter: Filter by assigned route stop
            limit: Maximum number of results
            offset: Number of results to skip

        Returns:
            List of Student entities
        """
        return await self.transport_repository.get_students(
            search_query=search_query,
            class_filter=class_filter,
            route_stop_filter=route_stop_filter,
            limit=limit,
            offset=offset,
        )


class GetStudentAllocationsUseCase:
    """
    Use case for retrieving a student's route allocations.
    """

    def __init__(self, transport_repository: TransportRepository):
        self.transport_repository = transport_repository

    async def execute(self, student_id: str) -> List[StudentRouteAllocation]:
        """
        Execute the get student allocations use case.

        Args:
            student_id: Student ID

        Returns:
            List of StudentRouteAllocation entities
        """
        if not student_id:
            raise ValueError("Student ID is required")

        return await self.transport_repository.get_student_allocations(student_id)


class GetAllocationsUseCase:
    """
    Use case for retrieving all student route allocations with filtering.
    """

    def __init__(self, transport_repository: TransportRepository):
        self.transport_repository = transport_repository

    async def execute(
        self,
        route_id: Optional[str] = None,
        student_id: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[StudentRouteAllocation]:
        """
        Execute the get allocations use case.

        Args:
            route_id: Filter by route ID (optional)
            student_id: Filter by student ID (optional)
            limit: Maximum number of results
            offset: Number of results to skip

        Returns:
            List of StudentRouteAllocation entities
        """
        return await self.transport_repository.get_allocations(
            route_id=route_id,
            student_id=student_id,
            limit=limit,
            offset=offset,
        )


class AssignStudentToRouteUseCase:
    """
    Use case for assigning a student to a route stop.
    """

    def __init__(self, transport_repository: TransportRepository):
        self.transport_repository = transport_repository

    async def execute(
        self,
        student_id: str,
        route_id: str,
        stop_id: str,
        allocation_type: str = "both",
    ) -> StudentRouteAllocation:
        """
        Execute the assign student to route use case.

        Args:
            student_id: Student ID
            route_id: Route ID
            stop_id: Stop ID
            allocation_type: Type of allocation ('pickup', 'dropoff', 'both')

        Returns:
            Created StudentRouteAllocation entity

        Raises:
            ValueError: If validation fails
        """
        if not student_id:
            raise ValueError("Student ID is required")
        if not route_id:
            raise ValueError("Route ID is required")
        if not stop_id:
            raise ValueError("Stop ID is required")
        if allocation_type not in ["pickup", "dropoff", "both"]:
            raise ValueError("Invalid allocation type")

        # Check if student exists
        student = await self.transport_repository.get_student_by_id(student_id)
        if not student:
            raise ValueError("Student not found")

        # Check if route exists
        route = await self.transport_repository.get_route_by_id(route_id)
        if not route:
            raise ValueError("Route not found")

        # Check if stop belongs to the route
        stops = await self.transport_repository.get_stops_by_route(route_id)
        if not any(stop.id == stop_id for stop in stops):
            raise ValueError("Stop does not belong to the specified route")

        return await self.transport_repository.assign_student_to_route(
            student_id=student_id,
            route_id=route_id,
            stop_id=stop_id,
            allocation_type=allocation_type,
        )


class UpdateStudentAllocationUseCase:
    """
    Use case for updating a student's route allocation.
    """

    def __init__(self, transport_repository: TransportRepository):
        self.transport_repository = transport_repository

    async def execute(
        self,
        allocation_id: str,
        route_id: Optional[str] = None,
        stop_id: Optional[str] = None,
        allocation_type: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> Optional[StudentRouteAllocation]:
        """
        Execute the update student allocation use case.

        Args:
            allocation_id: Allocation ID
            route_id: New route ID (optional)
            stop_id: New stop ID (optional)
            allocation_type: New allocation type (optional)
            is_active: New active status (optional)

        Returns:
            Updated StudentRouteAllocation entity if found, None otherwise

        Raises:
            ValueError: If validation fails
        """
        if not allocation_id:
            raise ValueError("Allocation ID is required")

        if allocation_type and allocation_type not in ["pickup", "dropoff", "both"]:
            raise ValueError("Invalid allocation type")

        # If route_id or stop_id is being updated, validate they exist and are related
        if route_id:
            route = await self.transport_repository.get_route_by_id(route_id)
            if not route:
                raise ValueError("Route not found")

        if route_id and stop_id:
            stops = await self.transport_repository.get_stops_by_route(route_id)
            if not any(stop.id == stop_id for stop in stops):
                raise ValueError("Stop does not belong to the specified route")

        return await self.transport_repository.update_student_allocation(
            allocation_id=allocation_id,
            route_id=route_id,
            stop_id=stop_id,
            allocation_type=allocation_type,
            is_active=is_active,
        )


class RemoveStudentAllocationUseCase:
    """
    Use case for removing a student's route allocation.
    """

    def __init__(self, transport_repository: TransportRepository):
        self.transport_repository = transport_repository

    async def execute(self, allocation_id: str) -> bool:
        """
        Execute the remove student allocation use case.

        Args:
            allocation_id: Allocation ID

        Returns:
            True if allocation was removed, False if not found
        """
        if not allocation_id:
            raise ValueError("Allocation ID is required")

        return await self.transport_repository.remove_student_allocation(allocation_id)


class GetRouteSummariesUseCase:
    """
    Use case for retrieving route summaries with student counts.
    """

    def __init__(self, transport_repository: TransportRepository):
        self.transport_repository = transport_repository

    async def execute(self) -> List[RouteSummary]:
        """
        Execute the get route summaries use case.

        Returns:
            List of RouteSummary entities
        """
        return await self.transport_repository.get_route_summaries()
