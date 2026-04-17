from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date

from app.infrastructure.database.database import get_db
from app.domain.usecases import teacher_usecases

router = APIRouter()


@router.get("/timetable")
async def get_teacher_timetable(
    teacher_id: int = Query(...),
    view: str = Query(..., description="day or week"),
    date_value: date = Query(...),
    db: AsyncSession = Depends(get_db),
):
    # -------------------------
    # VALIDATION
    # -------------------------
    if view not in ["day", "week"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid view. Use 'day' or 'week'",
        )

    # -------------------------
    # FETCH DATA
    # -------------------------
    result = await teacher_usecases.get_teacher_timetable(
        db=db,
        teacher_id=teacher_id,
        view=view,
        date_value=date_value,
    )

    # -------------------------
    # SAFE RESPONSE
    # -------------------------
    if not result:
        return {
            "teacher_id": teacher_id,
            "view": view,
            "date": date_value.isoformat(),
            "periods": [],
        }

    return result


@router.get("/peers")
async def get_peer_teachers(
    teacher_id: int = Query(...),
    db: AsyncSession = Depends(get_db),
):
    return await teacher_usecases.get_peer_teachers(db, teacher_id)
