"""
Timetable repository module.

This module provides data access layer for timetable operations.
"""

from typing import List

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.domain.entities.timetable import TimetablePeriod
from app.infrastructure.database.models import TimetablePeriodModel


class TimetableRepository:
    """
    Repository for timetable operations.
    """

    def __init__(self, session: Session):
        """
        Initialize repository with database session.

        Args:
            session: SQLAlchemy database session
        """
        self.session = session

    def get_timetable_for_class(self, class_id: int) -> List[TimetablePeriod]:
        """
        Get all timetable periods for a specific class.

        Args:
            class_id: The class ID

        Returns:
            List of TimetablePeriod entities
        """
        stmt = select(TimetablePeriodModel).where(
            TimetablePeriodModel.class_id == class_id
        ).order_by(
            TimetablePeriodModel.day_of_week,
            TimetablePeriodModel.period_number
        )

        result = self.session.execute(stmt)
        periods = result.scalars().all()

        return [
            TimetablePeriod(
                id=period.id,
                class_id=period.class_id,
                subject_id=period.subject_id,
                subject_name=period.subject.name,
                teacher_id=period.teacher_id,
                teacher_name=period.teacher.user.name,
                room_id=period.room_id,
                room_name=period.room.name,
                day_of_week=period.day_of_week,
                start_time=period.start_time,
                end_time=period.end_time,
                period_number=period.period_number,
            )
            for period in periods
        ]

    def get_timetable_for_class_and_day(
        self, class_id: int, day_of_week: int
    ) -> List[TimetablePeriod]:
        """
        Get timetable periods for a specific class and day.

        Args:
            class_id: The class ID
            day_of_week: Day of week (0=Monday, 6=Sunday)

        Returns:
            List of TimetablePeriod entities for the day
        """
        stmt = select(TimetablePeriodModel).where(
            and_(
                TimetablePeriodModel.class_id == class_id,
                TimetablePeriodModel.day_of_week == day_of_week
            )
        ).order_by(TimetablePeriodModel.period_number)

        result = self.session.execute(stmt)
        periods = result.scalars().all()

        return [
            TimetablePeriod(
                id=period.id,
                class_id=period.class_id,
                subject_id=period.subject_id,
                subject_name=period.subject.name,
                teacher_id=period.teacher_id,
                teacher_name=period.teacher.user.name,
                room_id=period.room_id,
                room_name=period.room.name,
                day_of_week=period.day_of_week,
                start_time=period.start_time,
                end_time=period.end_time,
                period_number=period.period_number,
            )
            for period in periods
        ]
