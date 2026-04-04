from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.api.schemas import (
    AcademicSummaryResponse,
    DashboardResponse,
    StatItem,
)
from app.core.errors import DatabaseError
from app.core.logger import Logger
from app.domain.entities.user import User
from app.domain.usecases.homework_usecases import (
    GetPendingHomeworkCountUseCase,
)
from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.database_homework_repository import (
    DatabaseHomeworkRepository,
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
            StatItem(label="Attendance", value="92%"),
            StatItem(label="Avg Marks", value="88%"),
            StatItem(label="Pending Homework", value=5),
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


@router.get(
    "/academic-summary",
    response_model=AcademicSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get academic summary for a child",
    description=(
        "Aggregate GET endpoint to return counts of pending homework "
        "for a given childId. Requires authentication."
    ),
)
async def get_academic_summary(
    child_id: str = Query(
        ...,
        alias="childId",
        description="The unique identifier of the child (student)",
    ),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AcademicSummaryResponse:
    """
    Get academic summary endpoint.

    Returns the count of pending homework assignments for the specified child.
    Pending homework includes assignments with status 'pending' or 'overdue'.
    """
    try:
        repository = DatabaseHomeworkRepository(db)
        use_case = GetPendingHomeworkCountUseCase(repository)
        count = await use_case.execute(child_id)
        return AcademicSummaryResponse(
            child_id=child_id,
            pending_homework_count=count,
        )
    except ValueError as e:
        Logger.warning(f"Invalid childId in academic-summary request: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except DatabaseError as e:
        Logger.error(
            f"Database error in academic-summary endpoint: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch academic summary",
        )
