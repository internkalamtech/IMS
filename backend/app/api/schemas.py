# =========================
# IMPORTS (FIXED)
# =========================

from pydantic import BaseModel, Field, EmailStr
from typing import Optional


# =========================
# ENROLLMENT
# =========================

class ParentInput(BaseModel):
    name: str
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    relationship_type: str = "Parent"


class StudentInput(BaseModel):
    name: str
    roll_number: str = Field(..., min_length=1)
    class_id: int
    class_name: str


class CreateStudentWithParentRequest(BaseModel):
    student: StudentInput
    parent: ParentInput
    link_existing_parent: bool = False


class StudentResponse(BaseModel):
    id: int
    name: str
    roll_number: str
    class_id: int
    class_name: str

    model_config = {"from_attributes": True}


class ParentResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    relationship_type: str

    model_config = {"from_attributes": True}


class CreateStudentWithParentResponse(BaseModel):
    student: StudentResponse
    parent: ParentResponse
    message: str


# =========================
# AUTHENTICATION
# =========================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class RoleResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

    model_config = {"from_attributes": True}


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    roles: list[RoleResponse]
    avatarUrl: Optional[str] = None

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    user: UserResponse
    access_token: str


class ErrorResponse(BaseModel):
    detail: str


class DemoCredential(BaseModel):
    role: str
    icon: str
    email: EmailStr
    password: str


class DemoCredentialsResponse(BaseModel):
    credentials: list[DemoCredential]


# =========================
# TRIPS
# =========================

class TripCreateRequest(BaseModel):
    driver_id: str
    route_id: str
    vehicle_id: str
    trip_type: str  # "pickup" or "drop_off"
    scheduled_start: str  # ISO datetime string
    total_students: int
    notes: Optional[str] = None


class TripUpdateStatusRequest(BaseModel):
    status: str  # "scheduled", "in_progress", "completed", "cancelled"


class TripResponse(BaseModel):
    id: str
    driver_id: str
    route_id: str
    vehicle_id: str
    trip_type: str
    status: str
    scheduled_start: str
    total_students: int
    actual_start: Optional[str] = None
    actual_end: Optional[str] = None
    boarded_count: int = 0
    notes: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = {"from_attributes": True}


class TripStopCreateRequest(BaseModel):
    stop_sequence: int
    location_name: str
    scheduled_time: str  # ISO datetime string
    expected_students: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None


class TripStopUpdateRequest(BaseModel):
    status: Optional[str] = None  # "pending", "in_progress", "completed"
    actual_arrival: Optional[str] = None
    actual_departure: Optional[str] = None
    boarded_students: Optional[int] = None
    notes: Optional[str] = None


class TripStopResponse(BaseModel):
    id: str
    trip_id: str
    stop_sequence: int
    location_name: str
    scheduled_time: str
    expected_students: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    actual_arrival: Optional[str] = None
    actual_departure: Optional[str] = None
    boarded_students: int = 0
    status: str = "pending"
    notes: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = {"from_attributes": True}


class StudentBoardingCreateRequest(BaseModel):
    student_id: str
    status: str  # "boarded", "no_show", "marked_absent"
    boarding_time: Optional[str] = None
    notes: Optional[str] = None


class StudentBoardingResponse(BaseModel):
    id: str
    trip_id: str
    stop_id: str
    student_id: str
    student_name: str
    status: str
    boarding_time: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = {"from_attributes": True}


# =========================
# CLASS SUBJECTS
# =========================

class SubjectInput(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None


class UpdateClassSubjectsRequest(BaseModel):
    class_id: int
    subjects: list[SubjectInput]


# =========================
# USERS
# =========================

class UserCreate(BaseModel):
    name: str
    email: EmailStr


# =========================
# DASHBOARD
# =========================

class StatItem(BaseModel):
    label: str
    value: str


class DashboardResponse(BaseModel):
    role: str
    stats: list[StatItem]