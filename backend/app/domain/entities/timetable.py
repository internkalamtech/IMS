"""
Timetable domain entities.

This module defines the domain entities for timetable functionality.
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class TimetablePeriod:
    """
    Domain entity for a timetable period.
    """

    id: int
    class_id: int
    subject_id: int
    subject_name: str
    teacher_id: int
    teacher_name: str
    room_id: int
    room_name: str
    day_of_week: int  # 0=Monday, 6=Sunday
    start_time: str  # HH:MM format
    end_time: str  # HH:MM format
    period_number: int

    def __post_init__(self):
        """Validate the entity after initialization."""
        if not (0 <= self.day_of_week <= 6):
            raise ValueError("day_of_week must be between 0 and 6")
        if self.period_number < 1:
            raise ValueError("period_number must be positive")


@dataclass
class TimetableDay:
    """
    Domain entity for a day's timetable.
    """

    day_of_week: int
    day_name: str
    periods: list[TimetablePeriod]

    def __post_init__(self):
        """Validate the entity after initialization."""
        if not (0 <= self.day_of_week <= 6):
            raise ValueError("day_of_week must be between 0 and 6")