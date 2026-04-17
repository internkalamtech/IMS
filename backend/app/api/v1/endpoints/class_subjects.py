"""
API endpoint for updating subjects associated with a class.

Provides a POST endpoint at `/class/subjects` that accepts:
- class ID
- list of subjects to associate with the class
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.api.schemas import UpdateClassSubjectsRequest
from app.domain.entities.user import User
from app.domain.usecases.update_class_subjects import UpdateClassSubjectsUseCase
from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.class_repository import ClassRepository
from app.infrastructure.repositories.subject_repository import SubjectRepository

router = APIRouter()


@router.post("/class/subjects")
async def update_class_subjects(
    request: UpdateClassSubjectsRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, object]:
    class_repo = ClassRepository(db)
    subject_repo = SubjectRepository(db)

    usecase = UpdateClassSubjectsUseCase(
        class_repo,
        subject_repo,
        db,
    )

    try:
        result = await usecase.execute(
            request.class_id,
            [s.model_dump() for s in request.subjects],
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    return result

