"""
Pydantic schemas for API request/response models.

These schemas define the shape of data for API endpoints.
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
    description: str | None = None


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: Literal["admin", "teacher", "student", "parent", "transport", "driver"]
    roles: list[RoleResponse]
    avatarUrl: str | None = None


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
    description: str | None = None


class DemoCredentialsResponse(BaseModel):
    credentials: list[DemoCredential]


class StatItem(BaseModel):
    label: str
    value: str | int


class DashboardResponse(BaseModel):
    role: str
    stats: list[StatItem]


# =========================
# USER
# =========================

class UserCreate(BaseModel):
    name: str
    email: str


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
# ✅ PAYMENT (FIX FOR TEST ERROR)
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
# ✅ ENROLLMENT (FIX FOR TESTS)
# =========================

class ParentInput(BaseModel):
    name: str
    email: EmailStr


class StudentInput(BaseModel):
    name: str


class CreateStudentWithParentRequest(BaseModel):
    student: StudentInput
    parent: ParentInput