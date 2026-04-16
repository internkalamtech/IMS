from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api.dependencies import get_db
from app.infrastructure.database import models

router = APIRouter()

@router.get("/subjects")
async def get_subjects(exam_id: int, db: AsyncSession = Depends(get_db)):
    # Use async execute instead of db.query
    result = await db.execute(
        select(models.SubjectModel).filter(models.SubjectModel.exam_id == exam_id)
    )
    subjects = result.scalars().all()

    return [
        {
            "subject_id": subj.id,
            "name": subj.name,
            "max_marks": subj.max_marks
        }
        for subj in subjects
    ]