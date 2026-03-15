"""
This module defines the API endpoint for updating the subjects
associated with a class.

It provides a POST endpoint at /class/subjects that accepts a
request body containing the class ID and a list of subjects to
be associated with that class.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.class_repository import (
    ClassRepository,
)
from app.infrastructure.repositories.subject_repository import (
    SubjectRepository,
)
from app.domain.usecases.update_class_subjects import (
    UpdateClassSubjectsUseCase,
)
from app.api.schemas import UpdateClassSubjectsRequest

router = APIRouter()


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
