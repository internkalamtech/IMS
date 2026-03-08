"""
Pydantic schemas for API request/response models.

These schemas define the shape of data for API endpoints.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Literal


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


# Transport Management Schemas

class StudentResponse(BaseModel):
    """Response schema for student data."""

    id: str
    name: str
    className: str
    rollNumber: str
    parentContact: str | None = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "1",
                    "name": "John Doe",
                    "className": "10A",
                    "rollNumber": "001",
                    "parentContact": "+1234567890",
                }
            ]
        }
    }


class StudentAllocationResponse(BaseModel):
    """Response schema for student allocation data."""

    id: str
    studentId: str
    routeId: str
    stopId: str
    allocationType: str
    isActive: bool

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "1",
                    "studentId": "1",
                    "routeId": "1",
                    "stopId": "1",
                    "allocationType": "both",
                    "isActive": True,
                }
            ]
        }
    }


class RouteSummaryResponse(BaseModel):
    """Response schema for route summary data."""

    routeId: str
    routeName: str
    vehicleCapacity: int | None = None
    studentCount: int
    utilizationPercentage: float

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "routeId": "1",
                    "routeName": "Route A",
                    "vehicleCapacity": 50,
                    "studentCount": 35,
                    "utilizationPercentage": 70.0,
                }
            ]
        }
    }


class AssignStudentRequest(BaseModel):
    """Request schema for assigning a student to a route."""

    studentId: str
    routeId: str
    stopId: str
    allocationType: str = "both"

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "studentId": "1",
                    "routeId": "1",
                    "stopId": "1",
                    "allocationType": "both",
                }
            ]
        }
    }


class UpdateAllocationRequest(BaseModel):
    """Request schema for updating a student allocation."""

    routeId: str | None = None
    stopId: str | None = None
    allocationType: str | None = None
    isActive: bool | None = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "routeId": "2",
                    "stopId": "3",
                    "allocationType": "pickup",
                    "isActive": True,
                }
            ]
        }
    }


class StudentsListResponse(BaseModel):
    """Response schema for paginated students list."""

    students: list[StudentResponse]
    total: int
    limit: int
    offset: int

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "students": [
                        {
                            "id": "1",
                            "name": "John Doe",
                            "className": "10A",
                            "rollNumber": "001",
                            "parentContact": "+1234567890",
                        }
                    ],
                    "total": 1,
                    "limit": 100,
                    "offset": 0,
                }
            ]
        }
    }


class RouteSummariesResponse(BaseModel):
    """Response schema for route summaries list."""

    summaries: list[RouteSummaryResponse]

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "summaries": [
                        {
                            "routeId": "1",
                            "routeName": "Route A",
                            "vehicleCapacity": 50,
                            "studentCount": 35,
                            "utilizationPercentage": 70.0,
                        }
                    ]
                }
            ]
        }
    }
