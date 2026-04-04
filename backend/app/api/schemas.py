"""
Pydantic schemas for API request/response models.

These schemas define the shape of data for API endpoints.
"""

from datetime import time

from pydantic import BaseModel, EmailStr, Field
from typing import List, Literal, Optional


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


class TokenRefreshRequest(BaseModel):
    """Request schema for token refresh endpoint."""

    access_token: str = Field(
        ..., description="The current or expired access token to refresh"
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
