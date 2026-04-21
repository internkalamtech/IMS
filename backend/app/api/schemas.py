# =========================
# IMPORTS (FIXED)
# =========================

from pydantic import BaseModel, Field, EmailStr
from typing import Optional


# =========================
# ENROLLMENT
# =========================

class ParentInput(BaseModel):
    name: str
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    relationship_type: str = "Parent"


class StudentInput(BaseModel):
    name: str
 feature/student-profile-ui
    roll_number: str = Field(..., min_length=1)
    email: str
    role: Literal["admin",
                  "teacher",
                  "student",
                  "parent",
                  "transport",
                  "driver"]
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
        "json_schema_extra": {
            "examples": [
                {"detail": "Error message"}
            ]
        }
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
 main
    class_id: int
    class_name: str


class CreateStudentWithParentRequest(BaseModel):
    student: StudentInput
    parent: ParentInput
    link_existing_parent: bool = False


class StudentResponse(BaseModel):
 feature/student-profile-ui

   """Response schema for student data."""

    id: int
    name: str
    roll_number: str
    class_id: Optional[int] = None
    class_name: str
    next_due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": 1,
                    "name": "Jane Doe",
                    "roll_number": "A-001",
                    "class_id": 1,
                    "class_name": "Grade 6-A",
                    "next_due_date": None,
                    "created_at": "2024-02-16T10:30:00",
                    "updated_at": "2024-02-16T10:30:00",
                }
            ]
        }
    }


class CreateStudentWithParentResponse(BaseModel):
    """Response schema for student and parent creation."""

    student: StudentResponse
    parent: ParentResponse
    message: str = "Student and parent created successfully with link established"

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "student": {
                        "id": 1,
                        "name": "Jane Doe",
                        "roll_number": "A-001",
                        "class_id": 1,
                        "class_name": "Grade 6-A",
                        "next_due_date": None,
                        "created_at": "2024-02-16T10:30:00",
                        "updated_at": "2024-02-16T10:30:00",
                    },
                    "parent": {
                        "id": 1,
                        "name": "John Doe",
                        "phone": "+1-555-123-4567",
                        "email": "john.doe@example.com",
                        "relationship": "Father",

                        "is_active": True,
                        "created_at": "2024-02-16T10:30:00",
                        "updated_at": "2024-02-16T10:30:00",
                    },
                    "message": "Student and parent created successfully with link established",
                }
            ]
        }
    }



class DocumentBase(BaseModel):
    """Base schema for Document."""
    title: str
    branch: Optional[str] = None
    scope: Optional[str] = None
    expiry_date: datetime


class DocumentCreate(DocumentBase):
    """Schema for creating a document."""
    pass


class DocumentUpdate(BaseModel):
    """Schema for updating a document."""
    title: Optional[str] = None
    branch: Optional[str] = None
    scope: Optional[str] = None
    expiry_date: Optional[datetime] = None


class DocumentResponse(DocumentBase):
    """Schema for document response, including computed fields."""
    id: int
    original_filename: str
    content_type: str
    upload_date: datetime
    uploaded_by_id: Optional[int] = None

    days_left: int
    status: Literal["Valid", "Expiring-Soon", "Expired"]

    model_config = {"from_attributes": True}


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
    def validate_reference_number_for_digital_payments(
        self,
    ) -> "PaymentCreate":
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
                f"reference_number is required for "
                f"{self.payment_mode} payments."
            )
        return self

class AverageMarksResponse(BaseModel):
    class_name: str
    average_marks: float
    average_attendance: float

class PaymentStudentResponse(BaseModel):
    """Response schema for student data in payment context."""

 main
    id: int
    name: str
    roll_number: str
    class_id: int
    class_name: str

    model_config = {"from_attributes": True}


class ParentResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    relationship_type: str

    model_config = {"from_attributes": True}


 feature/student-profile-ui
class CreateStudentWithParentResponse(BaseModel):
    student: StudentResponse
    parent: ParentResponse
    message: str
      
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

    class Config:
        from_attributes = True


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

    class Config:
        from_attributes = True
        main
