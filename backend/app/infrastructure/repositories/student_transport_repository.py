"""Repository for student transport enrollment persistence and queries."""

from datetime import time

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.infrastructure.database.models import (
    StudentModel,
    StudentTransportEnrollmentModel,
)


class StudentTransportRepository:
    """Data access for student-route enrollment records."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_student_by_id(self, student_id: int) -> StudentModel | None:
        result = await self.db.execute(select(StudentModel).where(StudentModel.id == student_id))
        return result.unique().scalar_one_or_none()

    async def get_enrollment(
        self,
        student_id: int,
        route_id: str,
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
        route_id: str,
        stop_id: int,
        pickup_time: time | None,
        dropoff_time: time | None,
    ) -> StudentTransportEnrollmentModel:
        # Concurrency-safe idempotent create: if another request inserts the same
        # (student_id, route_id) concurrently, we return the existing row.
        stmt = (
            insert(StudentTransportEnrollmentModel)
            .values(
                student_id=student_id,
                route_id=route_id,
                stop_id=stop_id,
                pickup_time=pickup_time,
                dropoff_time=dropoff_time,
            )
            .on_conflict_do_nothing(
                index_elements=[
                    StudentTransportEnrollmentModel.student_id,
                    StudentTransportEnrollmentModel.route_id,
                ]
            )
            .returning(StudentTransportEnrollmentModel.id)
        )

        result = await self.db.execute(stmt)
        created_id = result.scalar_one_or_none()

        if created_id is not None:
            created = await self.db.get(StudentTransportEnrollmentModel, created_id)
            if created is not None:
                return created

        existing = await self.get_enrollment(student_id=student_id, route_id=route_id)
        if existing is None:
            raise RuntimeError(
                "Enrollment upsert failed unexpectedly for "
                f"student_id={student_id}, route_id={route_id}"
            )
        return existing

    async def list_students_by_route(self, route_id: str) -> list[StudentTransportEnrollmentModel]:
        result = await self.db.execute(
            select(StudentTransportEnrollmentModel)
            .options(selectinload(StudentTransportEnrollmentModel.student))
            .where(StudentTransportEnrollmentModel.route_id == route_id)
            .order_by(StudentTransportEnrollmentModel.stop_id.asc())
        )
        return list(result.unique().scalars().all())
