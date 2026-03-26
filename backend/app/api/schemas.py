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


class CreateIncidentRequest(BaseModel):
    """Request schema for creating an incident."""

    type: Literal["breakdown", "accident", "delay"] = Field(
        ..., description="Type of incident"
    )
    severity: Literal["low", "medium", "high", "critical"] = Field(
        ..., description="Severity level of the incident"
    )
    description: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Description of the incident",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "type": "breakdown",
                    "severity": "high",
                    "description": (
                        "Vehicle engine overheating on Route 5"
                    ),
                }
            ]
        }
    }


class IncidentResponse(BaseModel):
    """Response schema for a single incident."""

    id: str
    driver_id: str
    type: str
    severity: str
    description: str
    status: str
    created_at: str | None = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "1",
                    "driver_id": "6",
                    "type": "breakdown",
                    "severity": "high",
                    "description": (
                        "Vehicle engine overheating on Route 5"
                    ),
                    "status": "open",
                    "created_at": "2026-03-26T10:30:00",
                }
            ]
        }
    }


class IncidentListResponse(BaseModel):
    """Response schema for list of incidents."""

    incidents: list[IncidentResponse]
