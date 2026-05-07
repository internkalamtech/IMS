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


class RecentUpdate(BaseModel):
    """Schema for a recent update/activity item."""

    id: str | None = None
    icon: str
    title: str
    subtitle: str
    timestamp: str
    type: Literal["homework", "exam", "announcement", "fee", "meeting"] | None = None


class ChildInfo(BaseModel):
    """Schema for child information (for parent dashboard)."""

    id: str
    name: str
    class_name: str
    roll_number: str
    avatar_initials: str


class ParentDashboardResponse(BaseModel):
    """Response schema for parent dashboard endpoint."""

    role: str
    child: ChildInfo | None = None
    stats: list[StatItem]
    recent_updates: list[RecentUpdate] = []


class StudentDashboardResponse(BaseModel):
    """Response schema for student dashboard endpoint."""

    role: str
    stats: list[StatItem]
    recent_updates: list[RecentUpdate] = []


class AcademicSummaryResponse(BaseModel):
    """Response schema for the academic summary endpoint."""

    child_id: str
    pending_homework_count: int


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


# Student & Parent Enrollment Schemas


class ParentInput(BaseModel):
    """Input schema for parent information."""

    name: str = Field(..., min_length=1, max_length=255, description="Parent full name")
    phone: str = Field(
        ..., min_length=10, max_length=20, description="Contact phone number"
    )
    email: EmailStr = Field(..., description="Parent email address")
    relationship_type: str = Field(
        default="Parent",
        max_length=50,
        description="Relationship to student (Parent, Guardian, etc.)",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "John Doe",
                    "phone": "+1-555-123-4567",
                    "email": "john.doe@example.com",
                    "relationship_type": "Father",
                }
            ]
        }
    }


class StudentInput(BaseModel):
    """Input schema for student information."""

    name: str = Field(..., min_length=1, max_length=255, description="Student full name")
    roll_number: str = Field(
        ..., min_length=1, max_length=50, description="Unique student roll number"
    )
    class_id: int = Field(..., description="ID of the class section")
    class_name: str = Field(
        ..., min_length=1, max_length=100, description="Class name/grade"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "Jane Doe",
                    "roll_number": "A-001",
                    "class_id": 1,
                    "class_name": "Grade 6-A",
                }
            ]
        }
    }


class CreateStudentWithParentRequest(BaseModel):
    """Request schema for creating a student with parent link."""

    student: StudentInput = Field(..., description="Student information")
    parent: ParentInput = Field(..., description="Parent information")
    link_existing_parent: bool = Field(
        default=False,
        description="If True, link to existing parent by email instead of creating new",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "student": {
                        "name": "Jane Doe",
                        "roll_number": "A-001",
                        "class_id": 1,
                        "class_name": "Grade 6-A",
                    },
                    "parent": {
                        "name": "John Doe",
                        "phone": "+1-555-123-4567",
                        "email": "john.doe@example.com",
                        "relationship": "Father",

                    },
                    "link_existing_parent": False,
                }
            ]
        }
    }


class ParentResponse(BaseModel):
    """Response schema for parent data."""

    id: int
    name: str
    phone: str
    email: str
    relationship_type: str

    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": 1,
                    "name": "John Doe",
                    "phone": "+1-555-123-4567",
                    "email": "john.doe@example.com",
                    "relationship_type": "Father",
                    "is_active": True,
                    "created_at": "2024-02-16T10:30:00",
                    "updated_at": "2024-02-16T10:30:00",
                }
            ]
        }
    }


class StaffCreate(BaseModel):
    """Request schema for creating a staff user."""

    name: str = Field(..., min_length=1, max_length=255, description="Full name")
    email: EmailStr = Field(..., description="Staff email")
    phone: str = Field(..., min_length=7, max_length=20, description="Contact phone")
    role: Literal["admin", "teacher", "transport", "driver"] = Field(
        ..., description="Staff role"
    )

    # Role-specific optional fields
    subjects: Optional[List[str]] = Field(None, description="List of subjects (for teachers)")
    class_assigned_id: Optional[int] = Field(None, description="Class section id assigned to teacher")
    license: Optional[str] = Field(None, description="Driver license number (for drivers)")


class StaffResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    role: str
    subjects: Optional[List[str]] = None
    class_assigned_id: Optional[int] = None
    class_assigned_name: Optional[str] = None
    license: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class StudentResponse(BaseModel):
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

    student_id: int = Field(..., description="ID of the student making the payment")
    fee_structure_id: int = Field(..., description="ID of the fee structure being paid against")
    amount: float = Field(..., gt=0, description="Payment amount (must be > 0)")
    payment_mode: PaymentMode = Field(..., description="Mode of payment: Cash, UPI, or Card")
    reference_number: Optional[str] = Field(
        None,
        description=(
            "Transaction reference number. "
            "Required for UPI and Card payments, optional for Cash."
        ),
    )
    remarks: Optional[str] = Field(None, max_length=500, description="Optional remarks or notes")

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

    id: int
    name: str
    roll_number: str
    class_name: str
    marks: Optional[float] = None
    attendance: Optional[float] = None
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
    student: PaymentStudentResponse

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
                    "remarks": "Monthly fee - April",
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

    class Config:
        from_attributes = True


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

# =========================
# 📅 ATTENDANCE SCHEMAS
# =========================

class AttendanceCreate(BaseModel):
    student_id: int
    class_name: str
    subject: str
    date: datetime
    status: Literal["present", "absent", "leave"]
    teacher_id: int


class AttendanceUpdate(BaseModel):
    status: Literal["present", "absent", "leave"]
    teacher_id: int

class StudentCreate(BaseModel):
    name: str
    roll_number: str
    class_name: str
