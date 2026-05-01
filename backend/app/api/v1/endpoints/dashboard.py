from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.api.dependencies import get_current_user
from app.api.schemas import (
    AcademicSummaryResponse,
    DashboardResponse,
    ParentDashboardResponse,
    StudentDashboardResponse,
    RecentUpdate,
    ChildInfo,
    StatItem,
)
from app.core.errors import DatabaseError
from app.core.logger import Logger
from app.domain.entities.user import User
from app.domain.usecases.homework_usecases import (
    GetPendingHomeworkCountUseCase,
)
from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import (
    StudentModel,
    ParentModel,
    HomeworkModel,
    UserModel,
)
from app.infrastructure.repositories.database_homework_repository import (
    DatabaseHomeworkRepository,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/stats",
    response_model=DashboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Get dashboard statistics",
    description=("Retrieve dashboard statistics based on the " "authenticated user's role."),
)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DashboardResponse:
    """
    Get dashboard statistics endpoint.

    Returns statistics relevant to the current user's role.
    """
    role = current_user.role
    stats = []
    role_label = role.capitalize()

    try:
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
            # Get parent's first child data from database
            parent_query = select(ParentModel).where(
                ParentModel.user_id == current_user.id
            )
            parent_result = await db.execute(parent_query)
            parent = parent_result.scalars().first()
            
            if parent and parent.students:
                child = parent.students[0]
                stats = [
                    StatItem(label="Attendance", value=f"{child.attendance or 92}%"),
                    StatItem(label="Avg Marks", value=f"{child.marks or 88}%"),
                ]
            else:
                stats = [
                    StatItem(label="Attendance", value="92%"),
                    StatItem(label="Avg Marks", value="88%"),
                ]
        elif role == "student":
            role_label = "Student"
            # Get student's own data from database
            student_query = select(StudentModel).where(
                StudentModel.id == current_user.id
            )
            student_result = await db.execute(student_query)
            student = student_result.scalars().first()
            
            if student:
                stats = [
                    StatItem(label="Attendance", value=f"{student.attendance or 94.5}%"),
                    StatItem(label="Avg Marks", value=f"{student.marks or 87.2}%"),
                ]
            else:
                stats = [
                    StatItem(label="Attendance", value="94.5%"),
                    StatItem(label="Avg Marks", value="87.2%"),
                ]
        elif role == "transport":
            role_label = "Transport Manager"
            stats = [
                StatItem(label="Total Routes", value="12"),
                StatItem(label="Total Buses", value="8"),
                StatItem(label="Active Trips", value="5"),
                StatItem(label="Total Students", value="245"),
            ]

        return DashboardResponse(role=role_label, stats=stats)
    
    except DatabaseError as e:
        Logger.error(f"Database error in get_dashboard_stats: {e}", exc_info=True)
        # Return fallback data on error
        return DashboardResponse(role=role_label, stats=stats)


@router.get(
    "/parent",
    response_model=ParentDashboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Get parent dashboard with child info",
    description="Retrieve parent dashboard with child information and recent updates.",
)
async def get_parent_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ParentDashboardResponse:
    """
    Get parent dashboard endpoint.

    Returns parent's child information, stats, and recent updates.
    """
    if current_user.role != "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only parents can access this endpoint",
        )
    
    try:
        # Get parent's first child
        parent_query = select(ParentModel).where(
            ParentModel.user_id == current_user.id
        )
        parent_result = await db.execute(parent_query)
        parent = parent_result.scalars().first()
        
        child_info = None
        stats = []
        
        if parent and parent.students:
            child = parent.students[0]
            # Create initials from child name
            initials = "".join([part[0].upper() for part in child.name.split()])[:2]
            child_info = ChildInfo(
                id=str(child.id),
                name=child.name,
                class_name=child.class_name,
                roll_number=child.roll_number,
                avatar_initials=initials,
            )
            stats = [
                StatItem(label="Attendance", value=f"{child.attendance or 88}%"),
                StatItem(label="Avg Marks", value=f"{child.marks or 85}%"),
            ]
        else:
            # Fallback data
            stats = [
                StatItem(label="Attendance", value="88%"),
                StatItem(label="Avg Marks", value="85%"),
            ]
        
        # Get recent updates (homework assignments)
        recent_updates = []
        homework_query = (
            select(HomeworkModel)
            .order_by(HomeworkModel.created_at.desc())
            .limit(3)
        )
        homework_result = await db.execute(homework_query)
        homework_items = homework_result.scalars().all()
        
        for hw in homework_items:
            recent_updates.append(
                RecentUpdate(
                    id=str(hw.id),
                    icon="book",
                    title="New Homework Assigned",
                    subtitle=f"{hw.subject} - Due soon",
                    timestamp="2 hours ago",
                    type="homework",
                )
            )
        
        # Add sample test result update
        if not recent_updates:
            recent_updates.append(
                RecentUpdate(
                    icon="checkmark-circle",
                    title="Test Results Published",
                    subtitle="Science - Score: 92/100",
                    timestamp="1 day ago",
                    type="exam",
                )
            )
        
        # Add PTM update
        recent_updates.append(
            RecentUpdate(
                icon="calendar",
                title="Parent-Teacher Meeting",
                subtitle="January 28, 2026 at 3:00 PM",
                timestamp="2 days ago",
                type="meeting",
            )
        )
        
        return ParentDashboardResponse(
            role="Parent",
            child=child_info,
            stats=stats,
            recent_updates=recent_updates[:3],  # Limit to 3 updates
        )
    
    except Exception as e:
        Logger.error(f"Error in get_parent_dashboard: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch parent dashboard data",
        )


@router.get(
    "/student",
    response_model=StudentDashboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Get student dashboard with stats",
    description="Retrieve student dashboard with stats and recent updates.",
)
async def get_student_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StudentDashboardResponse:
    """
    Get student dashboard endpoint.

    Returns student's stats and recent updates.
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint",
        )
    
    try:
        # Get student's own data
        student_query = select(StudentModel).where(
            StudentModel.id == current_user.id
        )
        student_result = await db.execute(student_query)
        student = student_result.scalars().first()
        
        stats = []
        if student:
            stats = [
                StatItem(label="Attendance", value=f"{student.attendance or 94.5}%"),
                StatItem(label="Avg Marks", value=f"{student.marks or 87.2}%"),
            ]
        else:
            stats = [
                StatItem(label="Attendance", value="94.5%"),
                StatItem(label="Avg Marks", value="87.2%"),
            ]
        
        # Get recent updates (homework, test results, announcements)
        recent_updates = [
            RecentUpdate(
                icon="book",
                title="Mathematics Homework Assigned",
                subtitle="Chapter 5 - Algebra",
                timestamp="2 hours ago",
                type="homework",
            ),
            RecentUpdate(
                icon="school",
                title="Science Test Result Published",
                subtitle="Score: 85/100",
                timestamp="5 hours ago",
                type="exam",
            ),
            RecentUpdate(
                icon="megaphone",
                title="Sports Day Announcement",
                subtitle="January 25, 2026",
                timestamp="1 day ago",
                type="announcement",
            ),
            RecentUpdate(
                icon="mail",
                title="Fee Payment Reminder",
                subtitle="Due: January 30, 2026",
                timestamp="2 days ago",
                type="fee",
            ),
        ]
        
        return StudentDashboardResponse(
            role="Student",
            stats=stats,
            recent_updates=recent_updates,
        )
    
    except Exception as e:
        Logger.error(f"Error in get_student_dashboard: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch student dashboard data",
        )


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
        # Validate childId format
        if not child_id or not child_id.strip():
            raise ValueError("childId is required")

        # Repository and use case setup
        repository = DatabaseHomeworkRepository(db)
        use_case = GetPendingHomeworkCountUseCase(repository)

        # Execute use case to get pending homework count
        count = await use_case.execute(child_id)

        return AcademicSummaryResponse(
            child_id=child_id,
            pending_homework_count=count,
        )

    except ValueError as e:
        Logger.warning(f"Invalid or missing childId in academic-summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
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
