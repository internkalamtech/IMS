from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import AttendanceModel

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.get("/monthly")
async def get_monthly_attendance(
    student_id: int | None = Query(None),
    class_id: int | None = Query(None),
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000),
    db: AsyncSession = Depends(get_db),
):
    if student_id is None and class_id is None:
        return {
            "detail": "Either student_id or class_id must be provided"
        }

    query = select(AttendanceModel).where(
        AttendanceModel.date >= f"{year}-{month:02d}-01"
    )

    if student_id is not None:
        query = query.where(AttendanceModel.student_id == student_id)

    if class_id is not None:
        query = query.where(AttendanceModel.class_id == class_id)

    result = await db.execute(query)
    records = result.scalars().all()

    monthly_records = [
        record
        for record in records
        if record.date.month == month and record.date.year == year
    ]

    total_days = len(monthly_records)
    present_days = sum(
        1 for record in monthly_records if record.status.lower() == "present"
    )
    attendance_percentage = (
        round((present_days / total_days) * 100, 2) if total_days > 0 else 0.0
    )

    return {
        "student_id": student_id,
        "class_id": class_id,
        "month": month,
        "year": year,
        "total_days": total_days,
        "present_days": present_days,
        "attendance_percentage": attendance_percentage,
        "records": [
            {
                "date": str(record.date),
                "status": record.status,
            }
            for record in monthly_records
        ],
    }