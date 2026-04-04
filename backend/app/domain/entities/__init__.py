"""
Domain entities - Pure business objects.
"""

from app.domain.entities.user import User, Role, UserRole
from app.domain.entities.trip import Trip, TripStatus, TripType
from app.domain.entities.trip_stop import TripStop, StopStatus
from app.domain.entities.student_boarding import StudentBoarding, BoardingStatus

__all__ = [
    "User",
    "Role",
    "UserRole",
    "Trip",
    "TripStatus",
    "TripType",
    "TripStop",
    "StopStatus",
    "StudentBoarding",
    "BoardingStatus",
]