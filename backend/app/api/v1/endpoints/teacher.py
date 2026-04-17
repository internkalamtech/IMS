from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date

from app.infrastructure.database.database import get_db
from app.domain.usecases import teacher_usecases

router = APIRouter()


@router.get("/timetable")
async def get_teacher_timetable(
    teacher_id: int = Query(...),
    view: str = Query(...),   # "day" or "week"
    date_value: date = Query(...),
    db: AsyncSession = Depends(get_db)
):
    return await teacher_usecases.get_teacher_timetable(
        db, teacher_id, view, date_value
    )


@router.get("/peers")
async def get_peer_teachers(
    teacher_id: int = Query(...),
    db: AsyncSession = Depends(get_db)
):
    return await teacher_usecases.get_peer_teachers(db, teacher_id)
