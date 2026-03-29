from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.database import get_db
from app.domain.usecases import teacher_usecases

router = APIRouter()  # ✅ create your own router

@router.get("/timetable")
async def get_teacher_timetable(
    teacher_id: int,
    db: AsyncSession = Depends(get_db)
):
    return await teacher_usecases.get_teacher_timetable(db, teacher_id)
@router.get("/peers")
async def get_peer_teachers(
    teacher_id: int,
    db: AsyncSession = Depends(get_db)
):
    return await teacher_usecases.get_peer_teachers(db, teacher_id)