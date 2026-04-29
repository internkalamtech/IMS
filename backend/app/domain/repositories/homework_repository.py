"""
Repository interface for homework data access.

Repositories define abstract interfaces for data operations.
Implementations are provided in the infrastructure layer.
"""

from abc import ABC, abstractmethod


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
