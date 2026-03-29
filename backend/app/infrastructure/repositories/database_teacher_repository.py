from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.infrastructure.database.models import TimetableModel


async def get_timetable_by_teacher(db: AsyncSession, teacher_id: int):
    result = await db.execute(
        select(TimetableModel).where(TimetableModel.teacher_id == teacher_id)
    )
    return result.scalars().all()
from sqlalchemy import text

async def get_peer_teachers(db, teacher_id: int):
    result = await db.execute(
        text("""
            SELECT u.id, u.name, u.email
            FROM users u
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
            WHERE r.name = 'teacher'
            AND u.id != :teacher_id
        """),
        {"teacher_id": teacher_id}
    )

    rows = result.fetchall()

    return [
        {"id": r[0], "name": r[1], "email": r[2]}
        for r in rows
    ]