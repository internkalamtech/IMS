"""
Student boarding domain entity for tracking individual student boarding.
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class BoardingStatus(str, Enum):
    """Possible boarding statuses."""
    BOARDED = "boarded"
    NO_SHOW = "no_show"
    MARKED_ABSENT = "marked_absent"


@dataclass
class StudentBoarding:
    """Domain entity for student boarding."""
    
    id: str
    trip_id: str
    stop_id: str
    student_id: str
    student_name: str
    status: BoardingStatus
    
    boarding_time: datetime | None = None
    notes: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None