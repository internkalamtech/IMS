from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.api.schemas import (
    ContactSubmitRequest,
    ContactSubmitResponse,
    DashboardResponse,
    StatItem,
)
from app.domain.entities.user import User
from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.database_contact_repository import (
    DatabaseContactRepository,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/stats",
    response_model=DashboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Get dashboard statistics",
    description=(
        "Retrieve dashboard statistics based on the "
        "authenticated user's role."
    ),
)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
) -> DashboardResponse:
    """
    Get dashboard statistics endpoint.

    Returns statistics relevant to the current user's role.
    """
    role = current_user.role

    stats = []
    role_label = role.capitalize()

    if role == "admin":
        role_label = "Branch Admin"
        stats = [
            StatItem(label="Total Students", value="1,250"),
            StatItem(label="Faculty Members", value=85),
            StatItem(label="Monthly Revenue", value="₹45k"),
        ]
    elif role == "teacher":
        role_label = "Senior Teacher"
        stats = [
            StatItem(label="Active Classes", value=4),
            StatItem(label="Upcoming Exams", value=2),
            StatItem(label="Pending Gradings", value=12),
        ]
    elif role == "parent":
        role_label = "Parent"
        # Stats matching prototype labels used by ParentDashboard
        stats = [
            StatItem(label="Attendance", value="88%"),
            StatItem(label="Avg Marks", value="85%"),
            StatItem(label="Fee Status", value="Paid"),
        ]
    elif role == "student":
        role_label = "Student"
        # Stats matching prototype labels used by StudentDashboard
        stats = [
            StatItem(label="Attendance", value="92%"),
            StatItem(label="Avg Score", value="8.5"),
            StatItem(label="Assignments Due", value=3),
        ]
    elif role == "transport":
        role_label = "Transport Staff"
        stats = [
            StatItem(label="Active Routes", value=4),
            StatItem(label="Students Assigned", value=120),
        ]
    elif role == "driver":
        role_label = "Driver"
        stats = [
            StatItem(label="Today's Route", value="Route A"),
            StatItem(label="Students Onboard", value=32),
        ]

    return DashboardResponse(role=role_label, stats=stats)


@router.post(
    "/contacts",
    response_model=ContactSubmitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit contact (name and email)",
    description=(
        "Submit a contact with name and email. "
        "Saved to database. Requires authentication."
    ),
)
async def submit_contact(
    body: ContactSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ContactSubmitResponse:
    """
    Submit contact information (name and email).
    Persists the data to the database and returns a success response.
    """
    repository = DatabaseContactRepository(db)
    await repository.create(name=body.name, email=body.email)
    return ContactSubmitResponse(message="Contact submitted successfully")
