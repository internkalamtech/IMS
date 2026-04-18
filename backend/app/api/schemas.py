"""
Pydantic schemas for API request/response models.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import List, Literal, Optional


# =========================
# AUTH SCHEMAS
# =========================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

    model_config = {
        "json_schema_extra": {
            "examples": [{"email": "admin@myuser.com", "password": "admin123"}]
        }
    }


class RoleResponse(BaseModel):
    id: str
    name: Literal["admin", "teacher", "student", "parent", "transport", "driver"]
    description: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: Literal["admin", "teacher", "student", "parent", "transport", "driver"]
    roles: List[RoleResponse]
    avatarUrl: Optional[str] = None


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
# PAYMENT
# =========================

class PaymentCreate(BaseModel):
    amount: float
    student_id: int


class PaymentResponse(BaseModel):
    id: int
    amount: float
    student_id: int

    model_config = {
        "from_attributes": True
    }


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


# =========================
# ENROLLMENT RESPONSE
# =========================

class StudentResponse(BaseModel):
    id: int
    name: str

    model_config = {
        "from_attributes": True
    }


class ParentResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    model_config = {
        "from_attributes": True
    }


class CreateStudentWithParentResponse(BaseModel):
    student: StudentResponse
    parent: ParentResponse
    message: str