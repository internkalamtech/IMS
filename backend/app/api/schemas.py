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
        ge=0,
        description=(
            "Class section ID. Use 0 to automatically target the default "
            "(first available) class section."
        ),
        examples=[0],
    )
    subjects: List[SubjectInput]

    model_config = {
        "json_schema_extra": {
            "example": {
                "class_id": 0,
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


class StudentResponse(BaseModel):
    """Student response payload for enrollment APIs."""

    id: int
    name: str
    roll_number: str
    class_id: int
    class_name: str
    next_due_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


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
    route_id: int = Field(..., alias="routeId", gt=0)
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
    route_id: int = Field(..., alias="routeId")
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

    route_id: int = Field(..., alias="routeId")
    total_students: int = Field(..., alias="totalStudents")
    students: List[RouteManifestStudentItem]

    model_config = {"populate_by_name": True}
