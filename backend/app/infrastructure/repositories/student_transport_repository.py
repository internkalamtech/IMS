"""Repository for student transport enrollment persistence and queries."""

from datetime import time

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.infrastructure.database.models import (
    StudentTransportEnrollmentModel,
    UserModel,
)


class StudentTransportRepository:
    """Data access for student-route enrollment records."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_student_by_id(self, student_id: int) -> UserModel | None:
        result = await self.db.execute(
            select(UserModel).where(UserModel.id == student_id)
        )
        return result.unique().scalar_one_or_none()

    async def get_enrollment(
        self,
        student_id: int,
        route_id: int,
    ) -> StudentTransportEnrollmentModel | None:
        result = await self.db.execute(
            select(StudentTransportEnrollmentModel).where(
                StudentTransportEnrollmentModel.student_id == student_id,
                StudentTransportEnrollmentModel.route_id == route_id,
            )
        )
        return result.scalar_one_or_none()

    async def create_enrollment(
        self,
        student_id: int,
        route_id: int,
        stop_id: int,
        pickup_time: time | None,
        dropoff_time: time | None,
    ) -> StudentTransportEnrollmentModel:
        enrollment = StudentTransportEnrollmentModel(
            student_id=student_id,
            route_id=route_id,
            stop_id=stop_id,
            pickup_time=pickup_time,
            dropoff_time=dropoff_time,
        )
        self.db.add(enrollment)
        await self.db.flush()
        return enrollment

    async def list_students_by_route(
        self, route_id: int
    ) -> list[StudentTransportEnrollmentModel]:
        result = await self.db.execute(
            select(StudentTransportEnrollmentModel)
            .options(selectinload(StudentTransportEnrollmentModel.student))
            .where(StudentTransportEnrollmentModel.route_id == route_id)
            .order_by(StudentTransportEnrollmentModel.stop_id.asc())
        )
        return list(result.unique().scalars().all())
