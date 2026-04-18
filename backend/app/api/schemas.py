"""
Pydantic schemas for API request/response models.

These schemas define the shape of data for API endpoints.
"""

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


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


class SubjectInput(BaseModel):
    """Schema for subject input when updating class subjects."""

    id: Optional[int] = None
    name: Optional[str] = None


class UpdateClassSubjectsRequest(BaseModel):
    """Request schema for updating class subjects."""

    class_id: int
    subjects: List[SubjectInput]


# ============ PAYMENT SCHEMAS ============

PaymentMode = Literal["Cash", "UPI", "Card"]
PaymentStatus = Literal["Paid", "Partial", "Pending", "Failed", "Overdue"]


class PaymentCreate(BaseModel):
    """Request schema for recording a payment."""

    student_id: int
    fee_structure_id: int
    amount: float = Field(..., gt=0, description="Payment amount (must be > 0)")
    payment_mode: PaymentMode
    reference_number: str | None = Field(
        None,
        description=(
            "Transaction reference number. "
            "Required for UPI and Card payments, optional for Cash."
        ),
    )
    remarks: str | None = None

    @model_validator(mode="after")
    def validate_reference_number_for_digital_payments(self) -> "PaymentCreate":
        """Ensure a reference number is supplied for UPI or Card payments."""
        if self.payment_mode in ("UPI", "Card") and not (
            self.reference_number and self.reference_number.strip()
        ):
            raise ValueError(
                f"reference_number is required for {self.payment_mode} payments."
            )
        return self


class PaymentResponse(BaseModel):
    """Response schema for a payment record."""

    id: int
    student_id: int
    fee_structure_id: int
    receipt_number: str
    amount: float
    payment_mode: PaymentMode
    reference_number: str | None = None
    status: PaymentStatus
    remarks: str | None = None
    payment_date: datetime

    model_config = ConfigDict(from_attributes=True)


class PaymentSummaryResponse(BaseModel):
    """Response schema for aggregated payment totals."""

    total_collectible: float
    total_collected: float
    total_pending: float
    total_overdue: float


class StudentResponse(BaseModel):
    """Response schema for student payment listings."""

    id: int
    name: str
    roll_number: str
    class_name: str
    next_due_date: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


# ============ TRIP SCHEMAS ============

class TripCreateRequest(BaseModel):
    """Request body for creating a trip."""
    driver_id: int
    route_id: str
    vehicle_id: str
    trip_type: str  # "pickup" or "drop_off"
    scheduled_start: datetime
    total_students: int


class TripUpdateStatusRequest(BaseModel):
    """Request body for updating trip status."""
    status: str  # "scheduled", "in_progress", "completed"


class TripResponse(BaseModel):
    """Response model for a trip."""
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
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class TripStopCreateRequest(BaseModel):
    """Request body for creating a trip stop."""
    stop_sequence: int
    location_name: str
    latitude: float
    longitude: float
    scheduled_time: datetime
    expected_students: int


class TripStopUpdateRequest(BaseModel):
    """Request body for updating trip stop status."""
    status: str
    boarded_students: int | None = None


class TripStopResponse(BaseModel):
    """Response model for a trip stop."""
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
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class StudentBoardingCreateRequest(BaseModel):
    """Request body for logging student boarding."""
    student_id: int
    student_name: str
    status: str


class StudentBoardingResponse(BaseModel):
    """Response model for a boarding record."""
    id: int
    trip_id: int
    stop_id: int
    student_id: int
    student_name: str
    status: str
    boarding_time: datetime | None = None
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
