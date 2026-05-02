from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.attendance_repository import AttendanceRepository
from app.api.schemas import AttendanceCreate, AttendanceUpdate

router = APIRouter(prefix="/attendance", tags=["Attendance"])

repo = AttendanceRepository()


@router.post("/")
async def create_attendance(
    payload: AttendanceCreate,
    db: Session = Depends(get_db),
):
    try:
        # ✅ Future date validation
        if payload.date.date() > date.today():
            raise HTTPException(
                status_code=400,
                detail="Attendance cannot be marked for future dates"
            )

        return await repo.create_attendance(
            db,
            payload.student_id,
            payload.class_name,
            payload.subject,
            payload.date,
            payload.status,
            payload.teacher_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{attendance_id}")
async def update_attendance(
    attendance_id: int,
    payload: AttendanceUpdate,
    db: Session = Depends(get_db),
):
    try:
        # ✅ Basic validation
        if payload.teacher_id <= 0:
            raise HTTPException(
                status_code=400,
                detail="Invalid teacher_id"
            )

        return await repo.update_attendance(
            db,
            attendance_id,
            payload.status,
            payload.teacher_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    
@router.get("/")
async def get_attendance(
    student_id: int | None = None,
    date: date | None = None,
    db: Session = Depends(get_db),
):
    return await repo.get_filtered_attendance(db, student_id, date)