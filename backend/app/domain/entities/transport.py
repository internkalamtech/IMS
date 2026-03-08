"""
Domain entities for transport management in the IMS Backend.

Entities represent core business objects with no dependencies
on external frameworks.
"""

from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class Student:
    """
    Student entity for transport management.

    Attributes:
        id: Unique identifier for the student (references User.id)
        name: Full name of the student
        class_name: Class/grade of the student
        roll_number: Roll number in the class
        parent_contact: Parent's contact information
    """

    id: str
    name: str
    class_name: str
    roll_number: str
    parent_contact: Optional[str] = None

    def to_dict(self) -> dict:
        """Convert entity to dictionary representation."""
        return {
            "id": self.id,
            "name": self.name,
            "className": self.class_name,
            "rollNumber": self.roll_number,
            "parentContact": self.parent_contact,
        }


@dataclass
class Vehicle:
    """
    Vehicle entity.

    Attributes:
        id: Unique identifier for the vehicle
        registration_number: Vehicle registration number
        model: Vehicle model
        capacity: Maximum number of students the vehicle can carry
        driver_id: ID of the assigned driver (references User.id)
        is_active: Whether the vehicle is currently active
    """

    id: str
    registration_number: str
    model: str
    capacity: int
    driver_id: Optional[str] = None
    is_active: bool = True

    def to_dict(self) -> dict:
        """Convert entity to dictionary representation."""
        return {
            "id": self.id,
            "registrationNumber": self.registration_number,
            "model": self.model,
            "capacity": self.capacity,
            "driverId": self.driver_id,
            "isActive": self.is_active,
        }


@dataclass
class Route:
    """
    Route entity.

    Attributes:
        id: Unique identifier for the route
        name: Name of the route
        description: Optional description of the route
        vehicle_id: ID of the assigned vehicle
        is_active: Whether the route is currently active
    """

    id: str
    name: str
    description: Optional[str] = None
    vehicle_id: Optional[str] = None
    is_active: bool = True

    def to_dict(self) -> dict:
        """Convert entity to dictionary representation."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "vehicleId": self.vehicle_id,
            "isActive": self.is_active,
        }


@dataclass
class Stop:
    """
    Stop entity representing a pickup/drop-off point.

    Attributes:
        id: Unique identifier for the stop
        route_id: ID of the route this stop belongs to
        name: Name of the stop location
        latitude: Geographic latitude
        longitude: Geographic longitude
        pickup_time: Scheduled pickup time
        dropoff_time: Scheduled drop-off time
        sequence_order: Order of the stop in the route
    """

    id: str
    route_id: str
    name: str
    latitude: float
    longitude: float
    pickup_time: Optional[datetime] = None
    dropoff_time: Optional[datetime] = None
    sequence_order: int = 0

    def to_dict(self) -> dict:
        """Convert entity to dictionary representation."""
        return {
            "id": self.id,
            "routeId": self.route_id,
            "name": self.name,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "pickupTime": self.pickup_time.isoformat() if self.pickup_time else None,
            "dropoffTime": self.dropoff_time.isoformat() if self.dropoff_time else None,
            "sequenceOrder": self.sequence_order,
        }


@dataclass
class StudentRouteAllocation:
    """
    Student route allocation entity.

    Attributes:
        id: Unique identifier for the allocation
        student_id: ID of the student
        route_id: ID of the route
        stop_id: ID of the pickup/drop-off stop
        allocation_type: Type of allocation ('pickup', 'dropoff', 'both')
        is_active: Whether this allocation is currently active
    """

    id: str
    student_id: str
    route_id: str
    stop_id: str
    allocation_type: str = "both"  # 'pickup', 'dropoff', 'both'
    is_active: bool = True

    def to_dict(self) -> dict:
        """Convert entity to dictionary representation."""
        return {
            "id": self.id,
            "studentId": self.student_id,
            "routeId": self.route_id,
            "stopId": self.stop_id,
            "allocationType": self.allocation_type,
            "isActive": self.is_active,
        }


@dataclass
class RouteSummary:
    """
    Route summary with student count and capacity information.

    Attributes:
        route_id: ID of the route
        route_name: Name of the route
        vehicle_capacity: Capacity of the assigned vehicle
        student_count: Current number of students allocated to the route
        utilization_percentage: Percentage of vehicle capacity utilized
    """

    route_id: str
    route_name: str
    vehicle_capacity: Optional[int] = None
    student_count: int = 0
    utilization_percentage: float = 0.0

    def to_dict(self) -> dict:
        """Convert entity to dictionary representation."""
        return {
            "routeId": self.route_id,
            "routeName": self.route_name,
            "vehicleCapacity": self.vehicle_capacity,
            "studentCount": self.student_count,
            "utilizationPercentage": round(self.utilization_percentage, 2),
        }
