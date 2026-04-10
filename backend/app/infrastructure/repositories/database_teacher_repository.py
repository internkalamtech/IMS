from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from sqlalchemy.orm import selectinload

from app.infrastructure.database.models import TimetableModel


# =========================
# GET TEACHER TIMETABLE
# =========================
async def get_teacher_timetable(db: AsyncSession, teacher_id: int):

    stmt = (
        select(TimetableModel)
        .where(TimetableModel.teacher_id == teacher_id)
        .options(
            selectinload(TimetableModel.class_)  # keep safe if relation exists
        )
        .order_by(TimetableModel.start_time)
    )

    result = await db.execute(stmt)
    rows = result.scalars().all()

    # IMPORTANT FIX: ensure empty list never becomes None upstream
    return rows or []


# =========================
# GET PEER TEACHERS
# =========================
async def get_peer_teachers(db: AsyncSession, teacher_id: int):

    stmt = text("""
        SELECT u.id, u.name, u.email
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE r.name = 'teacher'
        AND u.id != :teacher_id
    """)

    result = await db.execute(stmt, {"teacher_id": teacher_id})
    rows = result.fetchall()

    if not rows:
        return []

    return [
        {
            "id": r[0],
            "name": r[1],
            "email": r[2],
        }
        for r in rows
    ]
