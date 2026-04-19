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
from app.infrastructure.repositories.subject_repository import (
    SubjectRepository,
)
from app.domain.usecases.update_class_subjects import (
    UpdateClassSubjectsUseCase,
)
from app.api.schemas import (
    UpdateClassSubjectsRequest,
    UpdateClassSubjectsResponse,
)

router = APIRouter()


@router.get(
    "/classes",
    summary="List classes",
    description="Return available class sections.",
)
async def list_classes(db: AsyncSession = Depends(get_db)) -> list[dict]:
    result = await db.execute(select(ClassSectionModel).order_by(ClassSectionModel.id))
    classes = result.scalars().all()

    return [{"id": c.id, "name": c.name} for c in classes]


@router.post(
    "/class/subjects",
    response_model=UpdateClassSubjectsResponse,
    summary="Update class subjects",
    description="Assign one or more subjects to an existing class section.",
    openapi_extra={
        "requestBody": {
            "content": {
                "application/json": {
                    "example": {
                        "class_id": 0,
                        "subjects": [{"name": "Math"}, {"name": "Science"}],
                    }
                }
            }
        }
    },
)
async def update_class_subjects(
    request: UpdateClassSubjectsRequest,
    db: AsyncSession = Depends(get_db),
) -> UpdateClassSubjectsResponse:
    class_repo = ClassRepository(db)
    subject_repo = SubjectRepository(db)

    usecase = UpdateClassSubjectsUseCase(
        class_repo,
        subject_repo,
        db,
    )

    result = await usecase.execute(
        request.class_id,
        [s.model_dump(exclude_none=True) for s in request.subjects],
    )

    return UpdateClassSubjectsResponse(**result)
