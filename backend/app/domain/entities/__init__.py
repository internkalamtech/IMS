"""Domain entities."""

from app.domain.entities.user import User, Role, UserRole
from app.domain.entities.transport import (
    Student,
    Vehicle,
    Route,
    Stop,
    StudentRouteAllocation,
    RouteSummary,
)

__all__ = [
    "User",
    "Role",
    "UserRole",
    "Student",
    "Vehicle",
    "Route",
    "Stop",
    "StudentRouteAllocation",
    "RouteSummary",
]
