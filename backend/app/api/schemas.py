"""
Pydantic schemas for API request/response models.
"""

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import List, Literal, Optional


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
    description: str | None = None


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
    roles: list[RoleResponse]
    avatarUrl: str | None = None

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
    message: str = "Student and parent created successfully with link established"


# =========================
# PAYMENT (FINAL VERSION ONLY)
# =========================

PaymentMode = Literal["Cash", "UPI", "Card"]
PaymentStatus = Literal["Paid", "Partial", "Pending", "Failed", "Overdue"]


class PaymentCreate(BaseModel):
    student_id: int
    fee_structure_id: int
    amount: float = Field(..., gt=0)
    payment_mode: PaymentMode
    reference_number: Optional[str] = None
    remarks: Optional[str] = None

    @model_validator(mode="after")
    def validate_reference_number(self):
        if self.payment_mode in ("UPI", "Card") and not self.reference_number:
            raise ValueError("reference_number required for digital payments")
        return self


class PaymentResponse(BaseModel):
    id: int
    student_id: int
    fee_structure_id: int
    receipt_number: str
    amount: float
    payment_mode: PaymentMode
    reference_number: Optional[str]
    status: PaymentStatus
    remarks: Optional[str]
    payment_date: datetime

    model_config = {"from_attributes": True}