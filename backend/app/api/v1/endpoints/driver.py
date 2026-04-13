"""Driver endpoints for compliance documents and maintenance tasks."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.api.schemas import (
    ComplianceDocumentResponse,
    ErrorResponse,
    MaintenanceTaskResponse,
)
from app.core.errors import DatabaseError
from app.domain.entities.user import User
from app.domain.usecases.driver_usecases import (
    GetDriverDocumentsUseCase,
    GetDriverMaintenanceUseCase,
)
from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.database_driver_repository import (
    DatabaseDriverRepository,
)

router = APIRouter(prefix="/driver", tags=["Driver"])


def _ensure_driver_role(current_user: User) -> None:
    if current_user.role != "driver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only drivers can access this resource",
        )


@router.get(
    "/documents",
    response_model=list[ComplianceDocumentResponse],
    responses={
        403: {"model": ErrorResponse, "description": "Forbidden"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Get compliance documents for the assigned vehicle",
)
async def get_driver_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ComplianceDocumentResponse]:
    _ensure_driver_role(current_user)

    repository = DatabaseDriverRepository(db)
    use_case = GetDriverDocumentsUseCase(repository)

    try:
        documents = await use_case.execute(current_user.id)
        return [
            ComplianceDocumentResponse(
                title=document.title,
                expiryDate=document.expiry_date,
            )
            for document in documents
        ]
    except DatabaseError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=exc.message,
        )


@router.get(
    "/maintenance",
    response_model=list[MaintenanceTaskResponse],
    responses={
        403: {"model": ErrorResponse, "description": "Forbidden"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Get maintenance tasks for the assigned vehicle",
)
async def get_driver_maintenance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[MaintenanceTaskResponse]:
    _ensure_driver_role(current_user)

    repository = DatabaseDriverRepository(db)
    use_case = GetDriverMaintenanceUseCase(repository)

    try:
        tasks = await use_case.execute(current_user.id)
        return [
            MaintenanceTaskResponse(
                title=task.title,
                date=task.date,
                status=task.status,
            )
            for task in tasks
        ]
    except DatabaseError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=exc.message,
        )
