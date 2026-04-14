"""
Pydantic schemas for API request/response models.

These schemas define the shape of data for API endpoints.
"""

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, EmailStr, Field, model_validator


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


# ------------------------------------------------------------------ #
# Payment schemas
# ------------------------------------------------------------------ #

PaymentMode = Literal["Cash", "UPI", "Card"]
PaymentStatus = Literal["Paid", "Partial", "Pending", "Failed", "Overdue"]


class PaymentCreate(BaseModel):
    """
    Request schema for recording a new payment transaction.

    Validation rules:
    - ``amount`` must be a positive number.
    - ``reference_number`` is **required** when ``payment_mode`` is
      ``"UPI"`` or ``"Card"``; it remains optional for ``"Cash"``.
    """

    student_id: int = Field(
        ..., description="ID of the student making the payment"
    )
    fee_structure_id: int = Field(
        ..., description="ID of the fee structure being paid against"
    )
    amount: float = Field(
        ..., gt=0, description="Payment amount (must be > 0)"
    )
    payment_mode: PaymentMode = Field(
        ..., description="Mode of payment: Cash, UPI, or Card"
    )
    reference_number: Optional[str] = Field(
        None,
        description=(
            "Transaction reference number. "
            "Required for UPI and Card payments, optional for Cash."
        ),
    )
    remarks: Optional[str] = Field(
        None, max_length=500, description="Optional remarks or notes"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "student_id": 1,
                    "fee_structure_id": 1,
                    "amount": 5000.00,
                    "payment_mode": "UPI",
                    "reference_number": "UPI123456789",
                    "remarks": "Monthly fee \u2013 April",
                }
            ]
        }
    }

    @model_validator(mode="after")
    def validate_reference_number_for_digital_payments(self) -> "PaymentCreate":
        """
        Ensure a reference number is supplied for UPI or Card payments.

        Raises:
            ValueError: If payment_mode is UPI or Card but
                        reference_number is absent or blank.
        """
        if self.payment_mode in ("UPI", "Card") and not (
            self.reference_number and self.reference_number.strip()
        ):
            raise ValueError(
                f"reference_number is required for {self.payment_mode} payments."
            )
        return self


class StudentResponse(BaseModel):
    """Response schema for student data in payment context."""

    id: int
    name: str
    roll_number: str
    class_name: str
    next_due_date: Optional[datetime] = None

    model_config = {"from_attributes": True}


class FeeStructureResponse(BaseModel):
    """Response schema for fee structure data."""

    id: int
    student_id: int
    total_fee: float
    amount_paid: float
    balance: float
    fee_type: str
    academic_year: str

    model_config = {"from_attributes": True}


class PaymentResponse(BaseModel):
    """Response schema for a single payment transaction."""

    id: int
    student_id: int
    fee_structure_id: int
    receipt_number: str
    amount: float
    payment_mode: PaymentMode
    reference_number: Optional[str] = None
    status: PaymentStatus
    remarks: Optional[str] = None
    payment_date: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {
                    "id": 1,
                    "student_id": 1,
                    "fee_structure_id": 1,
                    "receipt_number": "REC-2024-A3F7",
                    "amount": 5000.00,
                    "payment_mode": "UPI",
                    "reference_number": "UPI123456789",
                    "status": "Paid",
                    "remarks": "Monthly fee \u2013 April",
                    "payment_date": "2024-04-01T10:00:00",
                }
            ]
        },
    }


class PaymentSummaryResponse(BaseModel):
    """Response schema for aggregated payment statistics."""

    total_collectible: float
    total_collected: float
    total_pending: float
    total_overdue: float

    model_config = {"from_attributes": True}


# ------------------------------------------------------------------ #
# Route schemas
# ------------------------------------------------------------------ #

class RouteStopCreate(BaseModel):
    """
    Schema for a single stop when creating or updating a route.

    Each stop carries the spatial data (lat/lng) and schedule data
    (arrival_time) that the acceptance criterion requires:
    \"nested arrays of stop metadata (latitude, longitude, time)\".

    Validation:
    - latitude:       -90.0 to +90.0 (WGS-84 bounds)
    - longitude:      -180.0 to +180.0 (WGS-84 bounds)
    - sequence_order: must be >= 1 (the first stop is 1, not 0)
    - arrival_time:   optional \"HH:MM\" string
    """

    name: str = Field(
        ..., min_length=1, max_length=255, description="Stop label"
    )
    latitude: float = Field(
        ..., ge=-90.0, le=90.0, description="GPS latitude (-90 to +90)"
    )
    longitude: float = Field(
        ..., ge=-180.0, le=180.0, description="GPS longitude (-180 to +180)"
    )
    sequence_order: int = Field(
        ..., ge=1, description="1-based travel order index"
    )
    arrival_time: Optional[str] = Field(
        None,
        max_length=10,
        description="Expected arrival in HH:MM format, e.g. '07:30'",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "Main Gate",
                    "latitude": 28.6139,
                    "longitude": 77.2090,
                    "sequence_order": 1,
                    "arrival_time": "07:30",
                }
            ]
        }
    }


class RouteStopResponse(BaseModel):
    """Response schema for a single route stop."""

    id: int
    route_id: int
    name: str
    latitude: float
    longitude: float
    sequence_order: int
    arrival_time: Optional[str] = None

    model_config = {"from_attributes": True}


class RouteCreate(BaseModel):
    """
    Request schema for creating a new transport route (POST /routes/).

    The ``stops`` list is the nested stop array the acceptance criteria
    requires.  At least one stop must be supplied (enforced at the use-
    case layer; Pydantic validates each stop's fields here).
    """

    name: str = Field(
        ..., min_length=1, max_length=255, description="Route name"
    )
    branch_id: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Branch identifier this route belongs to",
    )
    organization_id: Optional[str] = Field(
        None,
        max_length=100,
        description="Optional organization/school identifier",
    )
    description: Optional[str] = Field(
        None, max_length=500, description="Free-text description"
    )
    is_active: bool = Field(True, description="Whether route is active")
    stops: List[RouteStopCreate] = Field(
        ..., description="Ordered list of stop metadata"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "Morning Route A",
                    "branch_id": "BRANCH-01",
                    "organization_id": "ORG-001",
                    "description": "Covers the north zone",
                    "is_active": True,
                    "stops": [
                        {
                            "name": "Main Gate",
                            "latitude": 28.6139,
                            "longitude": 77.2090,
                            "sequence_order": 1,
                            "arrival_time": "07:30",
                        },
                        {
                            "name": "Park Crossing",
                            "latitude": 28.6200,
                            "longitude": 77.2150,
                            "sequence_order": 2,
                            "arrival_time": "07:45",
                        },
                    ],
                }
            ]
        }
    }


class RouteUpdate(BaseModel):
    """
    Request schema for updating a route (PUT /routes/{route_id}).

    All fields are optional so callers can do partial updates
    (e.g. just rename a route without re-sending all stops).
    If ``stops`` is provided, the ENTIRE stop list is replaced;
    if omitted, existing stops are unchanged.
    """

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    branch_id: Optional[str] = Field(None, min_length=1, max_length=100)
    organization_id: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None
    stops: Optional[List[RouteStopCreate]] = Field(
        None,
        description=(
            "Replacement stop list. If supplied all old stops "
            "are deleted and these are inserted."
        ),
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "Morning Route A (Updated)",
                    "is_active": True,
                    "stops": [
                        {
                            "name": "Main Gate",
                            "latitude": 28.6139,
                            "longitude": 77.2090,
                            "sequence_order": 1,
                            "arrival_time": "07:30",
                        }
                    ],
                }
            ]
        }
    }


class RouteResponse(BaseModel):
    """
    Response schema for a transport route.

    The ``stops`` field is the \"nested array of stop metadata\" the
    acceptance criteria requires.  Stops are always ordered by
    sequence_order so the frontend renders them in the correct travel order.
    """

    id: int
    name: str
    branch_id: str
    organization_id: Optional[str] = None
    description: Optional[str] = None
    is_active: bool
    stops: List[RouteStopResponse]
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {
                    "id": 1,
                    "name": "Morning Route A",
                    "branch_id": "BRANCH-01",
                    "organization_id": "ORG-001",
                    "description": "Covers the north zone",
                    "is_active": True,
                    "stops": [
                        {
                            "id": 1,
                            "route_id": 1,
                            "name": "Main Gate",
                            "latitude": 28.6139,
                            "longitude": 77.2090,
                            "sequence_order": 1,
                            "arrival_time": "07:30",
                        }
                    ],
                    "created_at": "2024-04-01T10:00:00",
                    "updated_at": "2024-04-01T10:00:00",
                }
            ]
        },
    }


class StudentRouteMappingCreate(BaseModel):
    """Request schema for assigning a student to a route."""

    student_id: int = Field(..., description="PK of the student")
    pickup_stop_id: Optional[int] = Field(
        None, description="PK of the boarding stop (optional)"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [{"student_id": 42, "pickup_stop_id": 1}]
        }
    }


class StudentRouteMappingResponse(BaseModel):
    """Response schema for a student-route mapping record."""

    id: int
    route_id: int
    student_id: int
    pickup_stop_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}
