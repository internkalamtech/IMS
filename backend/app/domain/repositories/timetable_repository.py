"""
Timetable repository interface.

This module defines the interface for timetable repository operations.
"""

from abc import ABC, abstractmethod
from typing import List

from app.domain.entities.timetable import TimetablePeriod


class TimetableRepository(ABC):
    """
    Interface for timetable repository operations.
    """

    @abstractmethod
    def get_timetable_for_class(self, class_id: int) -> List[TimetablePeriod]:
        """
        Get all timetable periods for a specific class.

        Args:
            class_id: The class ID

        Returns:
            List of TimetablePeriod entities
        """
        pass

    @abstractmethod
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
        pass
