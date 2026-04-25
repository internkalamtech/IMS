"""
Pydantic schemas for API request/response models.

These schemas define the shape of data for API endpoints.
"""

from datetime import date, datetime, time

from pydantic import AliasChoices, BaseModel, EmailStr, Field
from typing import List, Literal, Optional


class LoginRequest(BaseModel):
    """Request schema for login endpoint."""

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


class TokenRefreshRequest(BaseModel):
    """Request schema for token refresh endpoint."""

    access_token: str = Field(
        ...,
        description=(
            "An access token that is expiring soon or recently expired "
            "within the configured refresh window"
        ),
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
            ]
        }
    }


class TokenRefreshResponse(BaseModel):
    """Response schema for token refresh endpoint."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int = Field(
        ..., description="Token expiration time in seconds"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    "token_type": "bearer",
                    "expires_in": 1800,
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


class DocumentResponse(BaseModel):
    """Response schema for compliance document upload/list endpoints."""

    id: int
    title: str
    branch: Optional[str] = None
    scope: Optional[str] = None
    expiry_date: datetime
    original_filename: str
    content_type: str
    upload_date: datetime
    uploaded_by_id: Optional[int] = None
    days_left: int
    status: Literal["Valid", "Expiring-Soon", "Expired"]

    model_config = {"from_attributes": True}


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

    model_config = {
        "json_schema_extra": {
            "example": {"name": "Mathematics"}
        }
    }


class UpdateClassSubjectsRequest(BaseModel):
    """Request schema for updating class subjects."""

    class_id: int = Field(
        ...,
        gt=0,
        description="Class section ID.",
        examples=[1],
    )
    subjects: List[SubjectInput]

    model_config = {
        "json_schema_extra": {
            "example": {
                "class_id": 1,
                "subjects": [{"name": "Math"}, {"name": "Science"}],
            }
        }
    }


class UpdateClassSubjectsResponse(BaseModel):
    """Response schema for updating class subjects."""

    message: str
    class_id: int
    subjects_count: int


class StudentInput(BaseModel):
    """Student payload for create-student enrollment APIs."""

    name: str = Field(..., min_length=1)
    class_id: int = Field(
        ...,
        gt=0,
        validation_alias=AliasChoices("class_id", "classSectionId"),
        serialization_alias="classSectionId",
    )
    class_name: str = Field(
        ...,
        min_length=1,
        validation_alias=AliasChoices("class_name", "className"),
        serialization_alias="className",
    )
    roll_number: str = Field(..., alias="rollNumber", min_length=1)
    date_of_birth: Optional[date] = Field(default=None, alias="dateOfBirth")
    blood_group: Optional[str] = Field(default=None, alias="bloodGroup")

    model_config = {"populate_by_name": True}


class ParentInput(BaseModel):
    """Parent payload for create-student enrollment APIs.

    Current API contract requires all of these fields in requests:
    name, phone, email, and relationship_type.
    This applies whether link_existing_parent is False or True.
    """

    name: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=7)
    email: EmailStr = Field(
        ..., description="Parent's email address (required, must be unique)"
    )
    relationship_type: str = Field(
        ...,
        min_length=1,
        description="Relationship to student (e.g., Mother, Father, Guardian)",
        validation_alias=AliasChoices("relationship_type", "relationshipType"),
        serialization_alias="relationshipType",
    )
    address: Optional[str] = None


class CreateStudentWithParentRequest(BaseModel):
    """Create student request with parent details.

    The parent payload is used to either:
    1. Create a new parent (when link_existing_parent=False)
    2. Link to an existing parent by email (when link_existing_parent=True)

    Note: parent.name, parent.phone, parent.email, and parent.relationship_type
    are currently all required by schema and validation even when linking an
    existing parent.
    """

    student: StudentInput
    parent: ParentInput
    link_existing_parent: bool = Field(
        default=False,
        alias="linkExistingParent",
        description=(
            "Set to true to link by parent.email; however, the current request "
            "schema still requires parent.name, parent.phone, and "
            "parent.relationship_type as mandatory fields."
        ),
    )

    model_config = {"populate_by_name": True}


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
    """Student response payload for enrollment APIs."""

    id: int
    name: str
    roll_number: str
    class_id: Optional[int] = None
    class_name: str
    next_due_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ParentResponse(BaseModel):
    """Parent response payload for enrollment APIs."""

    id: int
    name: str
    phone: str
    email: EmailStr = Field(..., description="Parent's email address")
    relationship_type: str = Field(
        ..., description="Relationship to student"
    )
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class CreateStudentWithParentResponse(BaseModel):
    """Response for creating student with parent link."""

    student: StudentResponse
    parent: ParentResponse
    message: str


class StudentTransportEnrollmentCreate(BaseModel):
    """Single student transport enrollment payload."""

    student_id: int = Field(..., alias="studentId", gt=0)
    route_id: str = Field(..., alias="routeId", min_length=1)
    stop_id: int = Field(..., alias="stopId", gt=0)
    pickup_time: Optional[time] = Field(default=None, alias="pickupTime")
    dropoff_time: Optional[time] = Field(default=None, alias="dropoffTime")

    model_config = {"populate_by_name": True}


class CreateStudentTransportEnrollmentsRequest(BaseModel):
    """Request schema for bulk student transport enrollment creation."""

    enrollments: List[StudentTransportEnrollmentCreate]

class AverageMarksResponse(BaseModel):
    class_name: str
    average_marks: float
    average_attendance: float

class StudentTransportEnrollmentItem(BaseModel):
    """Created enrollment response item."""

    id: int
    student_id: int = Field(..., alias="studentId")
    route_id: str = Field(..., alias="routeId")
    stop_id: int = Field(..., alias="stopId")
    pickup_time: Optional[str] = Field(default=None, alias="pickupTime")
    dropoff_time: Optional[str] = Field(default=None, alias="dropoffTime")

    model_config = {"populate_by_name": True}


class CreateStudentTransportEnrollmentsResponse(BaseModel):
    """Response schema for enrollment creation endpoint."""

    message: str
    count: int
    enrollments: List[StudentTransportEnrollmentItem]


class RouteManifestStudentItem(BaseModel):
    """Student manifest item for a specific route."""

    student_id: int = Field(..., alias="studentId")
    student_name: str = Field(..., alias="studentName")
    stop_id: int = Field(..., alias="stopId")
    pickup_time: Optional[str] = Field(default=None, alias="pickupTime")
    dropoff_time: Optional[str] = Field(default=None, alias="dropoffTime")

    model_config = {"populate_by_name": True}


class RouteManifestResponse(BaseModel):
    """Route manifest response schema."""

    route_id: str = Field(..., alias="routeId", min_length=1)
    total_students: int = Field(..., alias="totalStudents")
    students: List[RouteManifestStudentItem]

    model_config = {"populate_by_name": True}


class TripCreateRequest(BaseModel):
    """Request schema for creating a trip."""

    driver_id: int = Field(..., alias="driverId", gt=0)
    route_id: str = Field(..., alias="routeId", min_length=1)
    vehicle_id: str = Field(..., alias="vehicleId", min_length=1)
    trip_type: Literal["pickup", "drop_off"] = Field(..., alias="tripType")
    scheduled_start: datetime = Field(..., alias="scheduledStart")
    total_students: int = Field(..., alias="totalStudents", ge=0)

    model_config = {"populate_by_name": True}


class TripUpdateStatusRequest(BaseModel):
    """Request schema for updating trip status."""

    status: Literal["scheduled", "in_progress", "completed", "cancelled"]
    notes: Optional[str] = None


class TripResponse(BaseModel):
    """Response schema for trip details."""

    id: int
    driver_id: int = Field(..., alias="driverId")
    route_id: str = Field(..., alias="routeId")
    vehicle_id: str = Field(..., alias="vehicleId")
    trip_type: str = Field(..., alias="tripType")
    status: str
    scheduled_start: datetime = Field(..., alias="scheduledStart")
    actual_start: Optional[datetime] = Field(default=None, alias="actualStart")
    actual_end: Optional[datetime] = Field(default=None, alias="actualEnd")
    total_students: int = Field(..., alias="totalStudents")
    boarded_count: int = Field(..., alias="boardedCount")
    created_at: Optional[datetime] = Field(default=None, alias="createdAt")
    updated_at: Optional[datetime] = Field(default=None, alias="updatedAt")

    model_config = {"populate_by_name": True}


class TripStopCreateRequest(BaseModel):
    """Request schema for creating a trip stop."""

    stop_sequence: int = Field(..., alias="stopSequence", ge=1)
    location_name: str = Field(..., alias="locationName", min_length=1)
    scheduled_time: datetime = Field(..., alias="scheduledTime")
    expected_students: int = Field(..., alias="expectedStudents", ge=0)
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    model_config = {"populate_by_name": True}


class TripStopUpdateRequest(BaseModel):
    """Request schema for updating stop status."""

    status: Literal["pending", "in_progress", "completed"]
    boarded_students: Optional[int] = Field(default=None, alias="boardedStudents", ge=0)

    model_config = {"populate_by_name": True}


class TripStopResponse(BaseModel):
    """Response schema for trip stop details."""

    id: int
    trip_id: int = Field(..., alias="tripId")
    stop_sequence: int = Field(..., alias="stopSequence")
    location_name: str = Field(..., alias="locationName")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    scheduled_time: datetime = Field(..., alias="scheduledTime")
    actual_arrival: Optional[datetime] = Field(default=None, alias="actualArrival")
    actual_departure: Optional[datetime] = Field(default=None, alias="actualDeparture")
    expected_students: int = Field(..., alias="expectedStudents")
    boarded_students: int = Field(..., alias="boardedStudents")
    status: str
    created_at: Optional[datetime] = Field(default=None, alias="createdAt")
    updated_at: Optional[datetime] = Field(default=None, alias="updatedAt")

    model_config = {"populate_by_name": True}


class StudentBoardingCreateRequest(BaseModel):
    """Request schema for logging student boarding."""

    student_id: int = Field(..., alias="studentId", gt=0)
    student_name: str = Field(..., alias="studentName", min_length=1)
    status: Literal["boarded", "no_show", "marked_absent"]

    model_config = {"populate_by_name": True}


class StudentBoardingResponse(BaseModel):
    """Response schema for boarding records."""

    id: int
    trip_id: int = Field(..., alias="tripId")
    stop_id: int = Field(..., alias="stopId")
    student_id: int = Field(..., alias="studentId")
    student_name: str = Field(..., alias="studentName")
    status: str
    boarding_time: Optional[datetime] = Field(default=None, alias="boardingTime")
    created_at: Optional[datetime] = Field(default=None, alias="createdAt")

    model_config = {"populate_by_name": True}
