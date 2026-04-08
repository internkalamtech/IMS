"""
Pydantic schemas for API request/response models.

These schemas define the shape of data for API endpoints.
"""

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Request schema for login endpoint."""

    email: EmailStr
    password: str = Field(
        ...,
        min_length=6,
        description="User password (minimum 6 characters)",
    )

    model_config = {
        "json_schema_extra": {"examples": [{"email": "admin@myuser.com", "password": "admin123"}]}
    }


class RoleResponse(BaseModel):
    """Response schema for role data."""

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
    """Response schema for user data."""

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
    """Response schema for login endpoint."""

    user: UserResponse
    access_token: str
    token_type: str = "bearer"

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "user": {
                        "id": "1",
                        "name": "Admin User",
                        "email": "admin@example.com",
                        "role": "admin",
                        "avatarUrl": ("https://i.pravatar.cc/150?u=admin"),
                    },
                    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    "token_type": "bearer",
                }
            ]
        }
    }


class ErrorResponse(BaseModel):
    """Response schema for errors."""

    detail: str

    model_config = {"json_schema_extra": {"examples": [{"detail": "Error message"}]}}


class DemoCredential(BaseModel):
    """Schema for a single demo credential."""

    role: str
    icon: str
    email: str
    password: str
    description: str | None = None


class DemoCredentialsResponse(BaseModel):
    """Response schema for demo credentials endpoint."""

    credentials: list[DemoCredential]


class StatItem(BaseModel):
    """Schema for a single dashboard statistic item."""

    label: str
    value: str | int


class DashboardResponse(BaseModel):
    """Response schema for the dashboard stats endpoint."""

    role: str
    stats: list[StatItem]


# ---------------------------------------------------------------------------
# Class-subject schemas
# ---------------------------------------------------------------------------


class SubjectInput(BaseModel):
    """Schema for subject input when updating class subjects."""

    id: Optional[int] = None
    name: Optional[str] = None


class UpdateClassSubjectsRequest(BaseModel):
    """Request schema for updating class subjects."""

    class_id: int
    subjects: List[SubjectInput]


# ---------------------------------------------------------------------------
# Payment schemas
# ---------------------------------------------------------------------------


class PaymentCreate(BaseModel):
    """Request schema for creating a payment transaction."""

    student_id: int = Field(..., gt=0, description="ID of the student")
    amount: float = Field(..., gt=0, description="Payment amount")
    payment_method: str = Field(..., min_length=1, description="Payment method (e.g., cash, card)")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "student_id": 1,
                    "amount": 500.0,
                    "payment_method": "cash",
                }
            ]
        }
    }


class PaymentResponse(BaseModel):
    """Response schema for a payment transaction."""

    id: str
    student_id: int
    amount: float
    payment_method: str
    payment_date: datetime


class LedgerEntryResponse(BaseModel):
    """Response schema for a single student ledger entry."""

    id: str
    student_id: int
    debit: float
    credit: float
    balance: float
    description: str
    transaction_date: datetime


class StudentLedgerResponse(BaseModel):
    """Response schema for a student's full ledger."""

    student_id: int
    transactions: list[LedgerEntryResponse]


class FeeDashboardResponse(BaseModel):
    """Response schema for the fee dashboard analytics."""

    total_collected: float
    total_pending: float
    students_paid: int
    students_pending: int


# ---------------------------------------------------------------------------
# Fee Structure schemas
# ---------------------------------------------------------------------------


class FeeHeadCreate(BaseModel):
    """Request schema for creating a fee head."""

    name: str = Field(..., min_length=1, description="Name of the fee head")
    description: str | None = Field(None, description="Description of the fee head")
    amount: float = Field(..., gt=0, description="Amount for this fee head")
    percentage: float | None = Field(None, ge=0, le=100, description="Percentage of total fee")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "Tuition Fee",
                    "description": "Regular tuition charges",
                    "amount": 5000.0,
                    "percentage": 60.0,
                }
            ]
        }
    }


class FeeHeadResponse(BaseModel):
    """Response schema for a fee head."""

    id: str
    name: str
    description: str | None
    amount: float
    percentage: float | None


class InstallmentCreate(BaseModel):
    """Request schema for creating an installment."""

    installment_number: int = Field(..., gt=0, description="Sequential number of the installment")
    due_date: datetime = Field(..., description="Due date for the installment")
    amount: float = Field(..., gt=0, description="Amount for this installment")
    description: str | None = Field(None, description="Description of the installment")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "installment_number": 1,
                    "due_date": "2024-04-01T00:00:00",
                    "amount": 3000.0,
                    "description": "First Installment",
                }
            ]
        }
    }


class InstallmentResponse(BaseModel):
    """Response schema for an installment."""

    id: str
    installment_number: int
    due_date: datetime
    amount: float
    description: str | None


class FeeStructureCreate(BaseModel):
    """Request schema for creating a fee structure."""

    class_id: int = Field(..., gt=0, description="ID of the class")
    academic_year: str = Field(..., min_length=1, description="Academic year (e.g., 2024-2025)")
    total_fee: float = Field(..., gt=0, description="Total fee amount")
    fee_heads: list[FeeHeadCreate] = Field(..., min_items=1, description="List of fee heads")
    installments: list[InstallmentCreate] = Field(
        ..., min_items=1, description="List of installments"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "class_id": 1,
                    "academic_year": "2024-2025",
                    "total_fee": 10000.0,
                    "fee_heads": [
                        {
                            "name": "Tuition Fee",
                            "description": "Regular tuition charges",
                            "amount": 6000.0,
                            "percentage": 60.0,
                        },
                        {
                            "name": "Lab Fee",
                            "description": "Laboratory charges",
                            "amount": 2000.0,
                            "percentage": 20.0,
                        },
                        {
                            "name": "Transport Fee",
                            "description": "Transport charges",
                            "amount": 2000.0,
                            "percentage": 20.0,
                        },
                    ],
                    "installments": [
                        {
                            "installment_number": 1,
                            "due_date": "2024-04-01T00:00:00",
                            "amount": 5000.0,
                            "description": "First Installment",
                        },
                        {
                            "installment_number": 2,
                            "due_date": "2024-08-01T00:00:00",
                            "amount": 5000.0,
                            "description": "Second Installment",
                        },
                    ],
                }
            ]
        }
    }


class FeeStructureUpdate(BaseModel):
    """Request schema for updating a fee structure."""

    total_fee: float | None = Field(None, gt=0, description="Total fee amount")
    fee_heads: list[FeeHeadCreate] | None = Field(None, description="List of fee heads")
    installments: list[InstallmentCreate] | None = Field(None, description="List of installments")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "total_fee": 12000.0,
                    "fee_heads": [
                        {
                            "name": "Tuition Fee",
                            "description": "Regular tuition charges",
                            "amount": 7000.0,
                            "percentage": 58.3,
                        }
                    ],
                }
            ]
        }
    }


class FeeStructureResponse(BaseModel):
    """Response schema for a complete fee structure."""

    id: str
    class_id: int
    academic_year: str
    total_fee: float
    fee_heads: list[FeeHeadResponse]
    installments: list[InstallmentResponse]
    created_at: datetime
    updated_at: datetime

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "1",
                    "class_id": 1,
                    "academic_year": "2024-2025",
                    "total_fee": 10000.0,
                    "fee_heads": [
                        {
                            "id": "1",
                            "name": "Tuition Fee",
                            "description": "Regular tuition charges",
                            "amount": 6000.0,
                            "percentage": 60.0,
                        }
                    ],
                    "installments": [
                        {
                            "id": "1",
                            "installment_number": 1,
                            "due_date": "2024-04-01T00:00:00",
                            "amount": 5000.0,
                            "description": "First Installment",
                        }
                    ],
                    "created_at": "2024-01-15T10:30:00",
                    "updated_at": "2024-01-15T10:30:00",
                }
            ]
        }
    }
