"""
API endpoints for class management.

Provides:
- GET `/classes` to fetch all available classes
- POST `/class/subjects` to update subjects associated with a class
"""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import ClassSectionModel
from app.infrastructure.repositories.class_repository import ClassRepository
from app.infrastructure.repositories.subject_repository import SubjectRepository
from app.domain.usecases.update_class_subjects import (
    UpdateClassSubjectsUseCase,
)
from app.api.schemas import UpdateClassSubjectsRequest

router = APIRouter()


@router.get("/classes")
async def get_classes(db: AsyncSession = Depends(get_db)):
    """
    Get all available classes.

    Returns a list of all classes with their IDs and names.
    """
    result = await db.execute(select(ClassSectionModel))
    classes = result.scalars().all()

    return [{"id": c.id, "name": c.name} for c in classes]


@router.post("/class/subjects")
async def update_class_subjects(
    request: UpdateClassSubjectsRequest,
    db: AsyncSession = Depends(get_db),
):
    class_repo = ClassRepository(db)
    subject_repo = SubjectRepository(db)

    usecase = UpdateClassSubjectsUseCase(
        class_repo,
        subject_repo,
        db,
    )

    result = await usecase.execute(
        request.class_id,
        [s.dict() for s in request.subjects],
    )

    return result
