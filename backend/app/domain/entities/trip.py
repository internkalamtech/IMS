"""
Trip domain entity for managing daily routes.
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class TripStatus(str, Enum):
    """Possible trip statuses."""
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TripType(str, Enum):
    """Type of trip."""
    PICKUP = "pickup"
    DROP_OFF = "drop_off"


@dataclass
class Trip:
    """Domain entity for a trip."""
    
    id: str
    driver_id: str
    route_id: str
    vehicle_id: str
    trip_type: TripType
    status: TripStatus
    scheduled_start: datetime
    total_students: int
    
    actual_start: datetime | None = None
    actual_end: datetime | None = None
    boarded_count: int = 0
    notes: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    def is_active(self) -> bool:
        """Check if trip is currently running."""
        return self.status == TripStatus.IN_PROGRESS

    def get_progress_percentage(self) -> float:
        """Calculate boarding progress."""
        if self.total_students == 0:
            return 0.0
        return (self.boarded_count / self.total_students) * 100