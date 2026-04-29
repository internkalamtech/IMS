from datetime import datetime
from sqlalchemy import select, and_
from app.infrastructure.database.models import AttendanceModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

class AttendanceRepository:

    async def get_all_attendance(self, db: AsyncSession):
        result = await db.execute(select(AttendanceModel))
        return result.scalars().all()

    async def create_attendance(
        self,
        db: AsyncSession,
        student_id,
        class_name,
        subject,
        date,
        status,
        teacher_id,
    ):
        if date > datetime.utcnow():
            raise ValueError("Cannot mark attendance for future dates")

        # ✅ Duplicate check
        result = await db.execute(
            select(AttendanceModel).where(
                and_(
                    AttendanceModel.student_id == student_id,
                    AttendanceModel.subject == subject,
                    AttendanceModel.date == date,
                )
            )
        )

        existing = result.scalars().first()

        if existing:
            raise ValueError("Attendance already marked for this student, subject, and date")

        # ✅ Create record
        attendance = AttendanceModel(
            student_id=student_id,
            class_name=class_name,
            subject=subject,
            date=date,
            status=status,
            teacher_id=teacher_id,
        )

        db.add(attendance)
        await db.commit()
        await db.refresh(attendance)

        return attendance

    async def update_attendance(self, db: AsyncSession, attendance_id, status, teacher_id):
        result = await db.execute(
            select(AttendanceModel).where(AttendanceModel.id == attendance_id)
        )
        attendance = result.scalar_one_or_none()

        if not attendance:
            raise ValueError("Attendance not found")

        attendance.status = status
        attendance.teacher_id = teacher_id

        await db.commit()
        await db.refresh(attendance)

        return attendance

    async def get_filtered_attendance(self, db: AsyncSession, student_id=None, date=None):
        query = select(AttendanceModel)

        if student_id:
            query = query.where(AttendanceModel.student_id == student_id)

        if date:
            query = query.where(func.date(AttendanceModel.date) == date)
        result = await db.execute(query)
        return result.scalars().all()