from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime
from enum import Enum


class StopType(str, Enum):
    PICKUP = "pickup"
    DROPOFF = "dropoff"
    BOTH = "both"


@dataclass
class RouteStop:
    id: int
    route_id: int
    stop_name: str
    stop_order: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: Optional[datetime] = None

    def __post_init__(self):
        if not self.stop_name or not self.stop_name.strip():
            raise ValueError("Stop name cannot be empty")
        if self.stop_order < 1:
            raise ValueError("Stop order must be a positive integer")


@dataclass
class Route:
    id: int
    route_name: str
    vehicle_id: int
    vehicle_capacity: int
    is_active: bool = True
    stops: list = field(default_factory=list)
    created_at: Optional[datetime] = None

    def get_total_allocated_students(self) -> int:
        """Returns total students allocated across all stops."""
        return sum(len(stop.allocations) for stop in self.stops if hasattr(stop, "allocations"))

    def is_over_capacity(self) -> bool:
        return self.get_total_allocated_students() > self.vehicle_capacity

    def available_seats(self) -> int:
        return self.vehicle_capacity - self.get_total_allocated_students()


@dataclass
class StudentAllocation:
    id: int
    student_id: int
    route_id: int
    route_stop_id: int
    stop_type: StopType
    is_active: bool = True
    assigned_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Joined / denormalized fields (for read operations)
    student_name: Optional[str] = None
    student_class: Optional[str] = None
    student_roll_no: Optional[str] = None
    stop_name: Optional[str] = None
    route_name: Optional[str] = None


@dataclass
class Student:
    id: int
    name: str
    roll_no: str
    class_name: str
    section: Optional[str] = None
    phone: Optional[str] = None
    parent_phone: Optional[str] = None
