from abc import ABC, abstractmethod
from typing import Optional
from .entities import StudentAllocation, Route, RouteStop


class StudentAllocationRepository(ABC):

    @abstractmethod
    def list_allocations(
        self,
        search_name: Optional[str] = None,
        class_name: Optional[str] = None,
        route_stop_id: Optional[int] = None,
        route_id: Optional[int] = None,
        is_active: Optional[bool] = True,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[list[StudentAllocation], int]:
        """Returns (list_of_allocations, total_count)"""
        ...

    @abstractmethod
    def get_allocation_by_id(self, allocation_id: int) -> Optional[StudentAllocation]:
        ...

    @abstractmethod
    def get_allocation_by_student(
        self, student_id: int, stop_type: str
    ) -> Optional[StudentAllocation]:
        ...

    @abstractmethod
    def create_allocation(self, allocation: StudentAllocation) -> StudentAllocation:
        ...

    @abstractmethod
    def update_allocation(
        self, allocation_id: int, route_stop_id: int, stop_type: str
    ) -> StudentAllocation:
        ...

    @abstractmethod
    def deactivate_allocation(self, allocation_id: int) -> bool:
        ...


class RouteRepository(ABC):

    @abstractmethod
    def get_route_with_capacity_summary(self, route_id: int) -> Optional[Route]:
        ...

    @abstractmethod
    def list_all_routes_summary(self) -> list[dict]:
        """
        Returns list of dicts:
        { route_id, route_name, vehicle_capacity,
          allocated_count, available_seats, is_over_capacity }
        """
        ...

    @abstractmethod
    def get_stop_by_id(self, stop_id: int) -> Optional[RouteStop]:
        ...

    @abstractmethod
    def list_stops_by_route(self, route_id: int) -> list[RouteStop]:
        ...
