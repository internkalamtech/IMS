"""
Subject repository for handling database operations related to subjects.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.models import SubjectModel


class SubjectRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, subject_id: int) -> SubjectModel | None:
        """
        Fetch subject by ID
        """

        result = await self.db.execute(
            select(SubjectModel).where(SubjectModel.id == subject_id)
        )

        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> SubjectModel | None:
        """
        Fetch subject by name
        """

        result = await self.db.execute(
            select(SubjectModel).where(SubjectModel.name == name)
        )

        return result.scalar_one_or_none()

    async def create(self, name: str) -> SubjectModel:
        """
        Create a new subject
        """

        subject = SubjectModel(name=name)

        self.db.add(subject)

        # flush sends data to DB but does not commit
        await self.db.flush()

        return subject
