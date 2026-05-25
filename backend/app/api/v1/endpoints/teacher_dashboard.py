from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import StaffModel

router = APIRouter()


@router.get("/teacher-dashboard/{teacher_id}")
async def get_teacher_dashboard(
    teacher_id: int,
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(StaffModel).where(StaffModel.id == teacher_id)
    )

    teacher = result.scalar_one_or_none()

    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    return {
        "success": True,
        "message": "Teacher dashboard fetched successfully",
        "data": {
            "id": teacher.id,
            "name": teacher.name,
            "email": teacher.email,
            "phone": teacher.phone,
            "role": teacher.role,
            "class_assigned": teacher.class_assigned_name,
            "subjects": teacher.subjects,
            "is_active": teacher.is_active,
        }
    }