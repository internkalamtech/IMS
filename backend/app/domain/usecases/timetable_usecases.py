"""
Timetable usecases.

This module contains business logic for timetable operations.
"""

from typing import List

from app.domain.entities.timetable import TimetableDay, TimetablePeriod
from app.domain.repositories.timetable_repository import (
    TimetableRepository,
)


class GetTimetableForClassUseCase:
    """
    Use case for getting timetable data for a class.
    """

    def __init__(self, timetable_repository: TimetableRepository):
        """
        Initialize use case with repository.

        Args:
            timetable_repository: Repository for timetable operations
        """
        self.timetable_repository = timetable_repository

    def execute(self, class_id: int) -> List[TimetablePeriod]:
        """
        Get all timetable periods for a class.

        Args:
            class_id: The class ID

        Returns:
            List of timetable periods
        """
        return self.timetable_repository.get_timetable_for_class(class_id)


class GetDailyTimetableForClassUseCase:
    """
    Use case for getting daily timetable data for a class.
    """

    def __init__(self, timetable_repository: TimetableRepository):
        """
        Initialize use case with repository.

        Args:
            timetable_repository: Repository for timetable operations
        """
        self.timetable_repository = timetable_repository

    def execute(self, class_id: int, day_of_week: int) -> TimetableDay:
        """
        Get timetable periods for a specific class and day.

        Args:
            class_id: The class ID
            day_of_week: Day of week (0=Monday, 6=Sunday)

        Returns:
            TimetableDay with periods for the day
        """
        periods = self.timetable_repository.get_timetable_for_class_and_day(
            class_id, day_of_week
        )

        day_names = [
            "Monday", "Tuesday", "Wednesday", "Thursday",
            "Friday", "Saturday", "Sunday"
        ]

        return TimetableDay(
            day_of_week=day_of_week,
            day_name=day_names[day_of_week],
            periods=periods
        )
