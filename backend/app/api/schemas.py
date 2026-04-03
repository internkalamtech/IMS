"""
Pydantic schemas for API request/response models.

These schemas define the shape of data for API endpoints.
"""

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


# ─── Attendance schemas (Issues #298–#300) ────────────────────────────────────

class ChildSummaryResponse(BaseModel):
    """Summary card for a single child — shown on the Multi-Child screen (#298)."""
    id: str
    name: str
    grade: str
    rollNo: str
    presentDays: int = 0
    absentDays: int = 0
    totalDays: int = 0
    overallAttendance: float      # e.g. 93.3
    monthlyAttendance: float
    status: str                   # e.g. "Present Today"
    statusColor: str              # hex colour for status badge
    emoji: str = "👦"


class MonthSummary(BaseModel):
    """Aggregate counts shown at the top of the Calendar screen (#299)."""
    present: int
    absent: int
    leave: int
    holiday: int
    notMarked: int


class CalendarDay(BaseModel):
    """Single day cell in the attendance calendar grid (#299)."""
    day: int
    status: str   # 'present' | 'absent' | 'leave' | 'holiday' | 'not-marked'


class LeaveHistoryItem(BaseModel):
    """One entry in the leave-history list (#299)."""
    id: str
    dateRange: str
    days: int
    reason: str
    status: str
    appliedDate: str
    teacherNote: str | None = None


class AttendanceCalendarResponse(BaseModel):
    """Full response for the calendar endpoint (#299 / #300)."""
    monthSummary: MonthSummary
    days: list[CalendarDay]
    leaveHistory: list[LeaveHistoryItem]


class LeaveRequestCreate(BaseModel):
    """Request body for submitting a leave application."""
    startDate: str   # YYYY-MM-DD
    endDate: str     # YYYY-MM-DD
    reason: str


class LeaveRequestResponse(BaseModel):
    """Response after successfully creating a leave request."""
    id: str
    dateRange: str
    days: int
    reason: str
    status: str
    appliedDate: str
    teacherNote: str | None = None


class SubjectInput(BaseModel):
    """Schema for subject input when updating class subjects."""

    id: Optional[int] = None
    name: Optional[str] = None


class UpdateClassSubjectsRequest(BaseModel):
    """Request schema for updating class subjects."""

    class_id: int
    subjects: List[SubjectInput]
