"""
Pydantic schemas for API request/response models.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import List, Literal, Optional
from datetime import datetime


# =========================
# AUTH SCHEMAS
# =========================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(
        ...,
        min_length=6,
        description="User password (minimum 6 characters)",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "email": "admin@myuser.com",
                    "password": "admin123",
                }
            ]
        }
    }


class RoleResponse(BaseModel):
    id: str
    name: Literal[
        "admin",
        "teacher",
        "student",
        "parent",
        "transport",
        "driver",
    ]
    description: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: Literal[
        "admin",
        "teacher",
        "student",
        "parent",
        "transport",
        "driver",
    ]
    roles: List[RoleResponse]
    avatarUrl: Optional[str] = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "1",
                    "name": "Admin User",
                    "email": "admin@myuser.com",
                    "role": "admin",
                    "roles": [
                        {
                            "id": "1",
                            "name": "admin",
                            "description": "Administrator",
                        }
                    ],
                    "avatarUrl": None,
                }
            ]
        }
    }


class LoginResponse(BaseModel):
    user: UserResponse
    access_token: str
    token_type: str = "bearer"


class ErrorResponse(BaseModel):
    detail: str


# =========================
# DEMO / DASHBOARD
# =========================

class DemoCredential(BaseModel):
    role: str
    icon: str
    email: str
    password: str
    description: Optional[str] = None


class DemoCredentialsResponse(BaseModel):
    credentials: List[DemoCredential]


class StatItem(BaseModel):
    label: str
    value: str | int


class DashboardResponse(BaseModel):
    role: str
    stats: List[StatItem]


# =========================
# USER
# =========================

class UserCreate(BaseModel):
    name: str
    email: EmailStr


# =========================
# SUBJECTS
# =========================

class SubjectInput(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None


class UpdateClassSubjectsRequest(BaseModel):
    class_id: int
    subjects: List[SubjectInput]


# =========================
# PAYMENT (basic)
# =========================

class PaymentCreate(BaseModel):
    amount: float
    student_id: int


class PaymentResponse(BaseModel):
    id: int
    amount: float
    student_id: int

    model_config = {"from_attributes": True}


# =========================
# ENROLLMENT
# =========================

class ParentInput(BaseModel):
    name: str
    email: EmailStr


class StudentInput(BaseModel):
    name: str


class CreateStudentWithParentRequest(BaseModel):
    student: StudentInput
    parent: ParentInput


class StudentResponse(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class ParentResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    model_config = {"from_attributes": True}


class CreateStudentWithParentResponse(BaseModel):
    student: StudentResponse
    parent: ParentResponse
    message: str


# =========================
# TRIP SCHEMAS (FIXED ERROR)
# =========================

class TripCreateRequest(BaseModel):
    driver_id: int
    route_id: str
    vehicle_id: str
    trip_type: str
    scheduled_start: datetime
    total_students: int


class TripUpdateStatusRequest(BaseModel):
    status: str


class TripResponse(BaseModel):
    id: int
    driver_id: int
    route_id: str
    vehicle_id: str
    trip_type: str
    status: str
    scheduled_start: datetime
    actual_start: datetime | None = None
    actual_end: datetime | None = None
    total_students: int
    boarded_count: int

    model_config = {"from_attributes": True}


class TripStopCreateRequest(BaseModel):
    stop_sequence: int
    location_name: str
    latitude: float
    longitude: float
    scheduled_time: datetime
    expected_students: int


class TripStopUpdateRequest(BaseModel):
    status: str
    boarded_students: int | None = None


class TripStopResponse(BaseModel):
    id: int
    trip_id: int
    stop_sequence: int
    location_name: str
    latitude: float
    longitude: float
    scheduled_time: datetime
    actual_arrival: datetime | None = None
    actual_departure: datetime | None = None
    expected_students: int
    boarded_students: int
    status: str

    model_config = {"from_attributes": True}


class StudentBoardingCreateRequest(BaseModel):
    student_id: int
    student_name: str
    status: str


class StudentBoardingResponse(BaseModel):
    id: int
    trip_id: int
    stop_id: int
    student_id: int
    student_name: str
    status: str
    boarding_time: datetime | None = None

    model_config = {"from_attributes": True}