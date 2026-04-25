"""
backend/app/domain/entities/parent_portal_entities.py
PHASE 4 & 5: Parent Portal & Student Portal - All Domain Entities
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional, List


# ACADEMICS
@dataclass
class AcademicRecordEntity:
    id: str
    student_id: str
    subject_id: str
    class_id: str
    marks: float
    grade: str
    academic_year: str
    term: str
    created_at: Optional[datetime] = None


@dataclass
class PerformanceAnalyticsEntity:
    id: str
    student_id: str
    gpa: float
    subject_performance: dict  # subject_id: percentage
    trends: List[dict]  # historical data
    comparison: dict  # peer comparison


# ATTENDANCE
class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    LEAVE = "leave"


@dataclass
class AttendanceEntity:
    id: str
    student_id: str
    class_id: str
    date: datetime
    status: AttendanceStatus
    marked_by_id: Optional[str] = None
    remarks: Optional[str] = None


@dataclass
class LeaveRequestEntity:
    id: str
    student_id: str
    class_id: str
    reason: str
    start_date: datetime
    end_date: datetime
    status: str  # pending, approved, rejected
    approved_by_id: Optional[str] = None
    created_at: Optional[datetime] = None


# CONDUCT
@dataclass
class ConductRecordEntity:
    id: str
    student_id: str
    class_id: str
    incident_date: datetime
    incident_type: str  # positive, negative
    description: str
    recorded_by_id: Optional[str] = None
    created_at: Optional[datetime] = None


# EXAMS
@dataclass
class ExamEntity:
    id: str
    exam_name: str
    class_id: str
    subject_id: str
    exam_date: datetime
    total_marks: float
    duration_minutes: int
    venue: str


@dataclass
class ResultEntity:
    id: str
    student_id: str
    exam_id: str
    marks_obtained: float
    grade: str
    percentile: float
    created_at: Optional[datetime] = None


# TRANSPORT (Parent view)
@dataclass
class BusRouteEntity:
    id: str
    route_number: str
    origin: str
    destination: str
    stops: List[str]
    timing: dict  # pickup/dropoff times
    driver_id: str
    vehicle_id: str


@dataclass
class RealTimeLocationEntity:
    id: str
    vehicle_id: str
    latitude: float
    longitude: float
    timestamp: datetime
    speed: float
    status: str  # in_transit, stopped


# STUDENT PORTAL
@dataclass
class StudentDashboardEntity:
    id: str
    student_id: str
    attendance_percentage: float
    total_assignments: int
    pending_assignments: int
    upcoming_exams: List[str]
    latest_marks: dict
    announcements: List[str]
