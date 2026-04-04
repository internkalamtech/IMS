"""
Trip stop domain entity for tracking stops along a route.
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class StopStatus(str, Enum):
    """Possible stop statuses."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


@dataclass
class TripStop:
    """Domain entity for a trip stop."""
    
    id: str
    trip_id: str
    stop_sequence: int
    location_name: str
    latitude: float
    longitude: float
    scheduled_time: datetime
    expected_students: int
    
    actual_arrival: datetime | None = None
    actual_departure: datetime | None = None
    boarded_students: int = 0
    status: StopStatus = StopStatus.PENDING
    notes: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    def mark_arrived(self, timestamp: datetime) -> None:
        """Record arrival at this stop."""
        self.status = StopStatus.IN_PROGRESS
        self.actual_arrival = timestamp

    def mark_completed(self, timestamp: datetime, boarded: int) -> None:
        """Record departure from this stop."""
        self.status = StopStatus.COMPLETED
        self.actual_departure = timestamp
        self.boarded_students = boarded