from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api.dependencies import get_db
from app.infrastructure.database import models

router = APIRouter()

@router.get("/subjects/{subject_id}/students")
async def get_students(subject_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.StudentModel).filter(models.StudentModel.subject_id == subject_id)
    )
    students = result.scalars().all()

    return [
        {
            "id": stu.id,
            "name": stu.name,
            "rollNumber": stu.roll_number
        }
        for stu in students
    ]
