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


# Transport-related schemas
class RouteResponse(BaseModel):
    """Response schema for route data."""

    id: str
    name: str
    status: Literal["on_time", "delayed", "cancelled", "completed"]
    total_stops: int
    total_students: int
    assigned_bus: str
    driver: str
    next_stop: str | None = None
    next_time: str | None = None
    current_location: dict | None = None
    delay_minutes: int = 0

    model_config = {
        "json_schema_extra": {
            "examples": [{
                "id": "route_001",
                "name": "Route A - School Express",
                "status": "on_time",
                "total_stops": 8,
                "total_students": 45,
                "assigned_bus": "BUS-001",
                "driver": "John Smith",
                "next_stop": "Stop 3 - Oak Street",
                "next_time": "14:15",
                "delay_minutes": 0
            }]
        }
    }


class RouteListResponse(BaseModel):
    """Response schema for route list."""

    routes: list[RouteResponse]
    total: int


class ComplianceStatusResponse(BaseModel):
    """Response schema for compliance status overview."""

    valid_documents: int
    expiring_soon: int
    expired: int

    model_config = {
        "json_schema_extra": {
            "examples": [{
                "valid_documents": 24,
                "expiring_soon": 5,
                "expired": 2
            }]
        }
    }


class AlertResponse(BaseModel):
    """Response schema for alert data."""

    id: str
    bus_id: str
    type: Literal["danger", "warning", "maintenance", "alert"]
    message: str
    timestamp: str  # ISO format datetime
    location: str
    resolved: bool = False

    model_config = {
        "json_schema_extra": {
            "examples": [{
                "id": "alert_001",
                "bus_id": "BUS-007",
                "type": "danger",
                "message": "Over-speeding detected - 68 km/h in 50 km/h zone",
                "timestamp": "2024-01-15T10:30:00Z",
                "location": "NH-8 Highway",
                "resolved": False
            }]
        }
    }


class AlertListResponse(BaseModel):
    """Response schema for alert list."""

    alerts: list[AlertResponse]
    total: int


class DocumentExpiryResponse(BaseModel):
    """Response schema for expiring document data."""

    id: str
    bus_id: str
    type: str
    document_number: str
    expiry_date: str  # ISO format date
    status: Literal["valid", "expiring_soon", "expired"]
    days_left: int

    model_config = {
        "json_schema_extra": {
            "examples": [{
                "id": "doc_001",
                "bus_id": "BUS-012",
                "type": "Insurance",
                "document_number": "INS2024001",
                "expiry_date": "2024-01-26T00:00:00Z",
                "status": "expiring_soon",
                "days_left": 7
            }]
        }
    }


class DocumentExpiryListResponse(BaseModel):
    """Response schema for expiring documents list."""

    documents: list[DocumentExpiryResponse]
    total: int


class TransportStatsResponse(BaseModel):
    """Response schema for comprehensive transport statistics."""

    total_routes: int
    active_trips: int
    total_students: int
    total_buses: int
    valid_documents: int
    expiring_documents: int
    expired_documents: int
    active_alerts: int

    model_config = {
        "json_schema_extra": {
            "examples": [{
                "total_routes": 12,
                "active_trips": 8,
                "total_students": 245,
                "total_buses": 10,
                "valid_documents": 24,
                "expiring_documents": 5,
                "expired_documents": 2,
                "active_alerts": 4
            }]
        }
    }


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
