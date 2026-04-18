from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class RoleResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    roles: list[RoleResponse]
    avatarUrl: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    user: UserResponse


class DemoCredential(BaseModel):
    role: str
    icon: str
    email: str
    password: str
    description: str


class DemoCredentialsResponse(BaseModel):
    credentials: list[DemoCredential]


class ErrorResponse(BaseModel):
    detail: str


class StatItem(BaseModel):
    label: str
    value: str | int


class DashboardResponse(BaseModel):
    role: str
    stats: list[StatItem]


class ExamScheduleResponse(BaseModel):
    """Response schema for exam schedule."""

    id: int
    subject_id: int
    subject_name: Optional[str] = None
    exam_date: datetime
    max_marks: float
    duration_minutes: int

    model_config = {"from_attributes": True}


class ExamResponse(BaseModel):
    """Response schema for exam with schedules."""

    id: int
    title: str
    description: Optional[str] = None
    class_id: int
    academic_year: str
    schedules: list[ExamScheduleResponse] = []

    model_config = {"from_attributes": True}


class SubjectResultResponse(BaseModel):
    """Response schema for subject-wise marks."""

    subject_id: int
    subject_name: Optional[str] = None
    obtained_marks: float
    max_marks: float
    percentage: float

    model_config = {"from_attributes": True}


class StudentResultResponse(BaseModel):
    """Response schema for student exam results."""

    id: int
    exam_id: int
    exam_title: Optional[str] = None
    total_marks: float
    obtained_marks: float
    percentage: float
    grade: str
    status: str
    rank: Optional[int] = None
    subject_results: list[SubjectResultResponse] = []

    model_config = {"from_attributes": True}


class StudentAcademicResponse(BaseModel):
    """Response schema for student academic profile."""

    student_id: int
    exams: list[ExamResponse] = []
    results: list[StudentResultResponse] = []

    model_config = {"from_attributes": True}


class ConductReplyResponse(BaseModel):
    """Response schema for conduct remark replies."""

    id: int
    parent_id: int
    parent_name: Optional[str] = None
    reply_text: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ConductRemarkResponse(BaseModel):
    """Response schema for conduct remarks."""

    id: int
    student_id: int
    teacher_id: Optional[int] = None
    teacher_name: Optional[str] = None
    category: str
    title: str
    remarks: str
    is_acknowledged: bool
    acknowledged_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    replies: list[ConductReplyResponse] = []

    model_config = {"from_attributes": True}


class ConductReplyCreate(BaseModel):
    """Request schema for creating conduct reply."""

    reply_text: str = Field(..., min_length=1, max_length=1000)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "reply_text": "Thank you for the feedback."
                }
            ]
        }
    }
