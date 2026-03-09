from fastapi import APIRouter, Depends, status
from app.api.dependencies import get_current_user
from app.api.schemas import DashboardResponse, StatItem
from app.domain.entities.user import User

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

    # In a real app, these would be fetched from a service/repository
    # which would query the database based on the role and branch.

    stats = []
    role_label = role.capitalize()

    if role == "admin":
        role_label = "Branch Admin"
        stats = [
            StatItem(label="Total Students", value="1,250"),
            StatItem(label="Faculty Members", value=85),
            StatItem(label="Monthly Revenue", value="$45k"),
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
        stats = [
            StatItem(label="Attendance (Aarav)", value="92%"),
            StatItem(label="Last Exam Score", value="88/100"),
            StatItem(label="Fee Status", value="Paid"),
        ]
    elif role == "student":
        role_label = "Student"
        stats = [
            StatItem(label="Course Progress", value="75%"),
            StatItem(label="Overall GPA", value="3.8"),
            StatItem(label="Assignments Due", value=3),
        ]

    return DashboardResponse(role=role_label, stats=stats)
