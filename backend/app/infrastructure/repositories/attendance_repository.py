from datetime import datetime
from sqlalchemy import select
from app.infrastructure.database.models import AttendanceModel
from sqlalchemy.ext.asyncio import AsyncSession

class AttendanceRepository:

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