"""
Timetable API endpoints.

This module provides REST API endpoints for timetable operations.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session, joinedload

from app.api.dependencies import get_current_user, get_db
from app.api.schemas import (
    ParentChildTimetableRecordResponse,
    TimetableDayResponse,
    TimetablePeriodResponse,
)
from app.domain.entities.timetable import TimetableDay, TimetablePeriod
from app.domain.entities.user import User
from app.domain.usecases.timetable_usecases import (
    GetDailyTimetableForClassUseCase,
    GetTimetableForClassUseCase,
)
from app.infrastructure.database.models import (
    ParentModel,
    StudentModel,
    TeacherModel,
    TimetablePeriodModel,
)
from app.infrastructure.repositories.timetable_repository import (
    TimetableRepository
)

router = APIRouter(prefix="/timetable", tags=["timetable"])


def get_timetable_repository(
    session: Session = Depends(get_db)
) -> TimetableRepository:
    """Dependency to get timetable repository."""
    return TimetableRepository(session)


def get_timetable_usecase(
    repo: TimetableRepository = Depends(get_timetable_repository),
) -> GetTimetableForClassUseCase:
    """Dependency to get timetable use case."""
    return GetTimetableForClassUseCase(repo)


def get_daily_timetable_usecase(
    repo: TimetableRepository = Depends(get_timetable_repository),
) -> GetDailyTimetableForClassUseCase:
    """Dependency to get daily timetable use case."""
    return GetDailyTimetableForClassUseCase(repo)


@router.get(
    "/class/{class_id}",
    response_model=List[TimetablePeriodResponse]
)
async def get_class_timetable(
    class_id: int,
    current_user: User = Depends(get_current_user),
    usecase: GetTimetableForClassUseCase = Depends(
        get_timetable_usecase
    ),
) -> List[TimetablePeriod]:
    """
    Get timetable for a specific class.

    Only accessible by authenticated users with appropriate permissions.
    """
    # TODO: Add authorization check to ensure user can access this class's
    # timetable
    # For now, allowing all authenticated users

    try:
        return usecase.execute(class_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve timetable: {str(e)}"
        )


@router.get(
    "/class/{class_id}/day/{day_of_week}",
    response_model=TimetableDayResponse
)
async def get_class_daily_timetable(
    class_id: int,
    day_of_week: int,
    current_user: User = Depends(get_current_user),
    usecase: GetDailyTimetableForClassUseCase = Depends(
        get_daily_timetable_usecase
    ),
) -> TimetableDay:
    """
    Get daily timetable for a specific class and day.

    Args:
        class_id: The class ID
        day_of_week: Day of week (0=Monday, 6=Sunday)

    Only accessible by authenticated users with appropriate permissions.
    """
    if not (0 <= day_of_week <= 6):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="day_of_week must be between 0 and 6"
        )

    # TODO: Add authorization check to ensure user can access this class's
    # timetable
    # For now, allowing all authenticated users

    try:
        return usecase.execute(class_id, day_of_week)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Failed to retrieve daily timetable: " + str(e)
            )
        )


@router.get(
    "/parent/children/{child_id}",
    response_model=List[ParentChildTimetableRecordResponse],
)
async def get_parent_child_timetable(
    child_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[ParentChildTimetableRecordResponse]:
    """
    Get timetable records for a child linked to the authenticated parent.

    Security:
    - The authenticated user must have parent role.
    - The requested child must be linked to the parent in
      parent_student mapping.
    """
    if "parent" not in {role.name for role in current_user.roles}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only parents can access child timetable data",
        )

    try:
        parent_result = await db.execute(
            select(ParentModel).where(
                ParentModel.user_id == int(current_user.id)
            )
        )
        parent = parent_result.scalar_one_or_none()

        if parent is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Parent profile not found",
            )

        child_result = await db.execute(
            select(StudentModel)
            .where(StudentModel.id == child_id)
            .where(StudentModel.parents.any(ParentModel.id == parent.id))
        )
        child = child_result.scalar_one_or_none()

        if child is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view this child's timetable",
            )

        timetable_result = await db.execute(
            select(TimetablePeriodModel)
            .options(
                joinedload(TimetablePeriodModel.subject),
                joinedload(TimetablePeriodModel.room),
                joinedload(TimetablePeriodModel.teacher).joinedload(
                    TeacherModel.user
                ),
            )
            .where(TimetablePeriodModel.class_id == child.class_id)
            .order_by(
                TimetablePeriodModel.day_of_week,
                TimetablePeriodModel.period_number,
            )
        )
        periods = timetable_result.scalars().all()

        return [
            ParentChildTimetableRecordResponse(
                period_id=period.id,
                day_of_week=period.day_of_week,
                start_time=period.start_time,
                end_time=period.end_time,
                subject_name=period.subject.name,
                teacher_name=period.teacher.user.name,
                room_location=period.room.name,
            )
            for period in periods
        ]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve child timetable: {str(e)}",
        )
