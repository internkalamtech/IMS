"""
Database-backed implementation of HomeworkRepository.

This module implements the HomeworkRepository interface using the database
with SQLAlchemy ORM.

Following Clean Architecture principles:
- Implements domain repository interface
- Uses infrastructure layer (database models)
- Handles data mapping between database models and domain entities
- Proper error handling and logging
"""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import DatabaseError
from app.core.logger import Logger
from app.domain.repositories.homework_repository import HomeworkRepository
from app.infrastructure.database.models import HomeworkModel


class DatabaseHomeworkRepository(HomeworkRepository):
    """
    Database-backed implementation of HomeworkRepository.

    Uses SQLAlchemy for data persistence.
    """

    def __init__(self, db: AsyncSession):
        """
        Initialize repository with database session.

        Args:
            db: SQLAlchemy async session
        """
        self.db = db

    async def get_pending_homework_count(self, child_id: str) -> int:
        """
        Return the count of pending homework assignments for a given child.

        Pending statuses include 'pending' and 'overdue'.

        Args:
            child_id: Unique identifier of the student (child)

        Returns:
            Integer count of pending homework assignments

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            Logger.info(
                f"Fetching pending homework count for child_id: {child_id}"
            )

            result = await self.db.execute(
                select(func.count()).where(
                    HomeworkModel.child_id == int(child_id),
                    HomeworkModel.status.in_(["pending", "overdue"]),
                )
            )
            count = result.scalar_one()

            Logger.info(
                f"Pending homework count for child_id {child_id}: {count}"
            )
            return count

        except Exception as e:
            Logger.error(
                f"Database error fetching homework count: {e}",
                exc_info=True,
            )
            raise DatabaseError(
                f"Failed to fetch pending homework count: {str(e)}"
            )
