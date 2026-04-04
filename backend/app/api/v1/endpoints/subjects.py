from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import SubjectModel

router = APIRouter()


@router.get("/subjects")
async def get_subjects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SubjectModel))
    subjects = result.scalars().all()

    return [{"id": s.id, "name": s.name} for s in subjects]
