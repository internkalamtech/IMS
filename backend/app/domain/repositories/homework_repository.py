"""
Repository interface for homework data access.

Repositories define abstract interfaces for data operations.
Implementations are provided in the infrastructure layer.
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import datetime

from app.domain.entities.homework import Homework


class HomeworkRepository(ABC):
    """
    Abstract repository for homework operations.

    This interface defines the contract for homework data access.
    Concrete implementations are provided in the infrastructure layer.
    """

    @abstractmethod
    async def get_pending_homework_count(self, child_id: str) -> int:
        """
        Return the count of pending homework assignments for a given child.

        Pending homework includes assignments with status
        'pending' or 'overdue'.

        Args:
            child_id: Unique identifier of the student (child)

        Returns:
            Integer count of pending homework assignments

        Raises:
            DatabaseError: If database operation fails
        """
        pass

    @abstractmethod
    async def get_homework_by_child(self, child_id: int) -> List[Homework]:
        """
        Get all homework assignments for a specific student.

        Args:
            child_id: Unique identifier of the student

        Returns:
            List of Homework entities for the student

        Raises:
            DatabaseError: If database operation fails
        """
        pass

    @abstractmethod
    async def get_homework_by_id(self, homework_id: int) -> Optional[Homework]:
        """
        Get a specific homework assignment by ID.

        Args:
            homework_id: Unique identifier of the homework

        Returns:
            Homework entity if found, None otherwise

        Raises:
            DatabaseError: If database operation fails
        """
        pass

    @abstractmethod
    async def get_homework_by_subject(
        self, child_id: int, subject: str
    ) -> List[Homework]:
        """
        Get homework assignments for a specific student in a subject.

        Args:
            child_id: Unique identifier of the student
            subject: Subject name

        Returns:
            List of Homework entities for the subject

        Raises:
            DatabaseError: If database operation fails
        """
        pass

