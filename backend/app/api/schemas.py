"""
Pydantic schemas for API request/response models.

These schemas define the shape of data for API endpoints.
"""

from datetime import date

from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import List, Literal, Optional


class LoginRequest(BaseModel):
    """Request schema for login endpoint."""

    email: EmailStr
    password: str = Field(..., min_length=6, description="User password (minimum 6 characters)")

    model_config = {
        "json_schema_extra": {"examples": [{"email": "admin@myuser.com", "password": "admin123"}]}
    }


class RoleResponse(BaseModel):
    """Response schema for role data."""

    id: str
    name: Literal["admin", "teacher", "student", "parent", "transport", "driver"]
    description: str | None = None


class UserResponse(BaseModel):
    """Response schema for user data."""

    id: str
    name: str
    email: str
    role: Literal["admin", "teacher", "student", "parent", "transport", "driver"]
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


class SubjectInput(BaseModel):
    """Schema for subject input when updating class subjects."""

    id: Optional[int] = None
    name: Optional[str] = None


class UpdateClassSubjectsRequest(BaseModel):
    """Request schema for updating class subjects."""

    class_id: int
    subjects: List[SubjectInput]


# ---------------------------------------------------------------------------
# Fee Structure schemas
# ---------------------------------------------------------------------------


class FeeItemCreate(BaseModel):
    """Schema for creating a fee item (fee head)."""

    head_name: str = Field(..., min_length=1, max_length=100)
    amount: float = Field(..., gt=0)


class InstallmentPlanCreate(BaseModel):
    """Schema for creating an installment plan entry."""

    due_date: date
    amount: float = Field(..., gt=0)


class FeeStructureCreate(BaseModel):
    """Request schema for creating a fee structure."""

    class_id: int
    academic_year: str = Field(..., min_length=1, max_length=20)
    items: List[FeeItemCreate] = Field(..., min_length=1)
    installments: List[InstallmentPlanCreate] = Field(default_factory=list)
    total_amount: float = Field(0.0, exclude=True)

    @model_validator(mode="after")
    def calculate_total(self) -> "FeeStructureCreate":
        """Automatically calculate total_amount from fee items."""
        self.total_amount = sum(item.amount for item in self.items)
        return self


class FeeStructureUpdate(BaseModel):
    """Request schema for updating a fee structure."""

    class_id: Optional[int] = None
    academic_year: Optional[str] = Field(None, min_length=1, max_length=20)
    items: Optional[List[FeeItemCreate]] = None
    installments: Optional[List[InstallmentPlanCreate]] = None
    total_amount: float = Field(0.0, exclude=True)

    @model_validator(mode="after")
    def calculate_total(self) -> "FeeStructureUpdate":
        """Automatically calculate total_amount from fee items if provided."""
        if self.items is not None:
            self.total_amount = sum(item.amount for item in self.items)
        return self


class FeeItemResponse(BaseModel):
    """Response schema for a fee item."""

    id: int
    head_name: str
    amount: float

    model_config = {"from_attributes": True}


class InstallmentPlanResponse(BaseModel):
    """Response schema for an installment plan entry."""

    id: int
    due_date: date
    amount: float

    model_config = {"from_attributes": True}


class FeeStructureResponse(BaseModel):
    """Response schema for a fee structure."""

    id: int
    class_id: int
    class_name: Optional[str] = None
    academic_year: str
    total_amount: float
    items: List[FeeItemResponse] = Field(default_factory=list)
    installments: List[InstallmentPlanResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}
