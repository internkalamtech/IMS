"""
Repository interfaces for transport data access.

Repositories define abstract interfaces for data operations.
Implementations are provided in the infrastructure layer.
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.transport import (
    Student,
    Vehicle,
    Route,
    Stop,
    StudentRouteAllocation,
    RouteSummary,
)


class TransportRepository(ABC):
    """
    Abstract repository for transport operations.

    This interface defines the contract for transport data access.
    Concrete implementations are provided in the infrastructure layer.
    """

    @abstractmethod
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
        pass

    @abstractmethod
    async def get_student_by_id(self, student_id: str) -> Optional[Student]:
        """
        Get a student by ID.

        Args:
            student_id: Student ID

        Returns:
            Student entity if found, None otherwise
        """
        pass

    @abstractmethod
    async def get_student_allocations(self, student_id: str) -> List[StudentRouteAllocation]:
        """
        Get all route allocations for a student.

        Args:
            student_id: Student ID

        Returns:
            List of StudentRouteAllocation entities
        """
        pass

    @abstractmethod
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
        pass

    @abstractmethod
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
        pass

    @abstractmethod
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
        pass

    @abstractmethod
    async def remove_student_allocation(self, allocation_id: str) -> bool:
        """
        Remove a student's route allocation.

        Args:
            allocation_id: Allocation ID

        Returns:
            True if allocation was removed, False if not found
        """
        pass

    @abstractmethod
    async def get_route_summaries(self) -> List[RouteSummary]:
        """
        Get summary of all routes with student counts and capacity.

        Returns:
            List of RouteSummary entities
        """
        pass

    @abstractmethod
    async def get_routes(self) -> List[Route]:
        """
        Get all routes.

        Returns:
            List of Route entities
        """
        pass

    @abstractmethod
    async def get_route_by_id(self, route_id: str) -> Optional[Route]:
        """
        Get a route by ID.

        Args:
            route_id: Route ID

        Returns:
            Route entity if found, None otherwise
        """
        pass

    @abstractmethod
    async def get_stops_by_route(self, route_id: str) -> List[Stop]:
        """
        Get all stops for a route.

        Args:
            route_id: Route ID

        Returns:
            List of Stop entities
        """

