from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.models.user_model import User


class DashboardRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_total_students(self):
        result = await self.db.execute(
            select(func.count()).select_from(
                User).where(User.role == "student")
        )
        return result.scalar()

    async def get_total_teachers(self):
        result = await self.db.execute(
            select(func.count()).select_from(
                User).where(User.role == "teacher")
        )
        return result.scalar()
