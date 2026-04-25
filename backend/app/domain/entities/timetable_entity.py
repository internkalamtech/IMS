"""
backend/app/domain/entities/timetable_entity.py
PHASE_3: Timetable Management - All 5 Stories
"""

from dataclasses import dataclass
from datetime import datetime, time
from enum import Enum
from typing import Optional, List


class DayOfWeek(str, Enum):
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"


class TimeSlotStatus(str, Enum):
    AVAILABLE = "available"
    SCHEDULED = "scheduled"
    CONFLICT = "conflict"
    BLOCKED = "blocked"


@dataclass
class TimeSlot:
    start_time: time
    end_time: time
    subject_id: str
    teacher_id: str
    room_id: str
    day: DayOfWeek
    status: TimeSlotStatus = TimeSlotStatus.AVAILABLE


@dataclass
class TimetableEntity:
    id: str
    class_id: str
    academic_year: str
    time_slots: List[TimeSlot]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_approved: bool = False
    approved_by_id: Optional[str] = None
    notes: Optional[str] = None
    is_deleted: bool = False
    
    def validate(self) -> None:
        if not self.class_id or not self.academic_year:
            raise ValueError("Class and academic year required")
        # Conflict detection
        for slot in self.time_slots:
            for other in self.time_slots:
                if slot != other and self._overlaps(slot, other):
                    raise ValueError(f"Conflict detected: {slot.subject_id} overlaps")
    
    def _overlaps(self, slot1: TimeSlot, slot2: TimeSlot) -> bool:
        if slot1.day != slot2.day or slot1.room_id != slot2.room_id:
            return False
        return not (slot1.end_time <= slot2.start_time or slot1.start_time >= slot2.end_time)


@dataclass
class TeacherPreference:
    teacher_id: str
    available_days: List[DayOfWeek]
    preferred_slots: List[str]
    blackout_dates: List[datetime]
    max_classes_per_day: int = 6
