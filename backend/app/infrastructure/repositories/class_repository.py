"""
Class section repository for handling database operations related to class sections.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.infrastructure.database.models import ClassSectionModel


class ClassRepository:
    """
    Repository for ClassSection database operations.
    Handles fetching and saving class-related data.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, class_id: int) -> ClassSectionModel | None:
        """
        Fetch a class section by ID.

        Uses selectinload to eagerly load subjects relationship
        to avoid lazy-loading issues in async environments.
        """

        result = await self.db.execute(
            select(ClassSectionModel)
            .options(selectinload(ClassSectionModel.subjects))
            .where(ClassSectionModel.id == class_id)
        )

        return result.scalar_one_or_none()

    async def save(self, class_obj: ClassSectionModel) -> ClassSectionModel:
        """
        Save changes to a class object.
        """

        self.db.add(class_obj)

        await self.db.commit()

        await self.db.refresh(class_obj)

        return class_obj
