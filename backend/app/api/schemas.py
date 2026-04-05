"""
Pydantic schemas for API request/response models.

These schemas define the shape of data for API endpoints.
"""

from datetime import datetime
from typing import Literal

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
