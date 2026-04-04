"""
Pydantic schemas for API request/response models.

These schemas define the shape of data for API endpoints.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Literal
from datetime import datetime


class LoginRequest(BaseModel):
    """Request schema for login endpoint."""

    email: EmailStr
    password: str = Field(
        ..., min_length=6, description="User password (minimum 6 characters)"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [{"email": "admin@myuser.com", "password": "admin123"}]
        }
    }


class RoleResponse(BaseModel):
    """Response schema for role data."""

    id: str
    name: Literal[
        "admin", "teacher", "student", "parent", "transport", "driver"
    ]
    description: str | None = None


class UserResponse(BaseModel):
    """Response schema for user data."""

    id: str
    name: str
    email: str
    role: Literal[
        "admin", "teacher", "student", "parent", "transport", "driver"
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
                        "avatarUrl": "https://i.pravatar.cc/150?u=admin",
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

    model_config = {
        "json_schema_extra": {"examples": [{"detail": "Error message"}]}
    }


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


# Fee Management Schemas


class FeeStructureResponse(BaseModel):
    """Response schema for fee structure data."""

    id: str
    student_id: str
    fee_head: str
    total_amount: float
    is_mandatory: bool
    academic_year: str

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "fs-001",
                    "student_id": "std-123",
                    "fee_head": "Tuition Fee",
                    "total_amount": 50000.0,
                    "is_mandatory": True,
                    "academic_year": "2024-2025",
                }
            ]
        }
    }


class FeeSummaryResponse(BaseModel):
    """Response schema for aggregated fee summary."""

    student_id: str
    total_fee: float
    paid_amount: float
    balance_due: float
    next_due_date: datetime | None = None
    status_percentage: float = Field(
        ..., ge=0, le=100, description="Percentage of fees paid (0-100)"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "student_id": "std-123",
                    "total_fee": 100000.0,
                    "paid_amount": 50000.0,
                    "balance_due": 50000.0,
                    "next_due_date": "2024-05-15T00:00:00",
                    "status_percentage": 50.0,
                }
            ]
        }
    }


class InstallmentResponse(BaseModel):
    """Response schema for fee installment data."""

    id: str
    fee_structure_id: str
    student_id: str
    due_date: datetime
    amount: float
    status: Literal["Pending", "Paid", "Overdue"]
    paid_date: datetime | None = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "inst-001",
                    "fee_structure_id": "fs-001",
                    "student_id": "std-123",
                    "due_date": "2024-04-15T00:00:00",
                    "amount": 25000.0,
                    "status": "Paid",
                    "paid_date": "2024-04-10T10:30:00",
                }
            ]
        }
    }


class TransactionResponse(BaseModel):
    """Response schema for transaction/receipt data."""

    id: str
    student_id: str
    installment_id: str | None = None
    amount: float
    payment_mode: Literal["UPI", "Card", "Cash", "Check", "Online"]
    transaction_ref: str
    receipt_number: str
    created_at: datetime
    description: str | None = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "txn-001",
                    "student_id": "std-123",
                    "installment_id": "inst-001",
                    "amount": 25000.0,
                    "payment_mode": "Online",
                    "transaction_ref": "TXN123456789",
                    "receipt_number": "REC-A1B2C3D4",
                    "created_at": "2024-04-10T10:30:00",
                    "description": "Payment for tuition fee",
                }
            ]
        }
    }
