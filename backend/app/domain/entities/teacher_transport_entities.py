"""
backend/app/domain/entities/teacher_transport_entities.py
PHASE 6 & 7: Teacher Portal & Transport Management - All Domain Entities
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional, List


# TEACHER ACADEMICS
@dataclass
class ClassManagementEntity:
    id: str
    class_id: str
    teacher_id: str
    subject: str
    students_count: int
    academic_year: str


@dataclass
class MarksEntryEntity:
    id: str
    subject_id: str
    class_id: str
    term: str
    marks_list: List[dict]  # student_id: marks


@dataclass
class AssignmentEntity:
    id: str
    class_id: str
    subject_id: str
    teacher_id: str
    title: str
    description: str
    due_date: datetime
    total_marks: float
    rubric: Optional[dict] = None


# TEACHER ASSESSMENT
@dataclass
class QuestionEntity:
    id: str
    question_text: str
    question_type: str  # mcq, short_answer, essay
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    marks: float = 1.0
    difficulty: str = "medium"


@dataclass
class TestEntity:
    id: str
    teacher_id: str
    class_id: str
    title: str
    questions: List[str]  # question_ids
    total_marks: float
    duration_minutes: int
    scheduled_date: datetime


# TEACHER LEAVE
@dataclass
class LeaveApplicationEntity:
    id: str
    teacher_id: str
    leave_type: str  # sick, casual, earned
    start_date: datetime
    end_date: datetime
    reason: str
    status: str  # pending, approved, rejected
    applied_date: datetime
    approved_by_id: Optional[str] = None


@dataclass
class LeaveBalanceEntity:
    id: str
    teacher_id: str
    academic_year: str
    casual_leaves: int
    sick_leaves: int
    earned_leaves: int
    used_leaves: int


# TRANSPORT MANAGEMENT
@dataclass
class VehicleEntity:
    id: str
    registration_number: str
    vehicle_type: str  # bus, van
    capacity: int
    manufacturer: str
    purchase_year: int
    driver_id: str
    route_id: str


@dataclass
class DriverEntity:
    id: str
    employee_id: str
    name: str
    license_number: str
    license_expiry: datetime
    phone: str
    experience_years: int
    background_check_status: str


@dataclass
class RouteEntity:
    id: str
    route_number: str
    origin: str
    destination: str
    distance_km: float
    estimated_time: int
    stops: List[str]
    morning_schedule: dict
    evening_schedule: dict
    assigned_vehicle_id: Optional[str] = None


@dataclass
class ComplianceChecklistEntity:
    id: str
    vehicle_id: str
    check_date: datetime
    brake_condition: str
    tire_condition: str
    lights_working: bool
    emergency_kit: bool
    first_aid_box: bool
    fire_extinguisher: bool
    insurance_valid: bool
    pollution_cert_valid: bool
    checked_by_id: str
