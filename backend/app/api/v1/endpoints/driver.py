"""Driver compliance and maintenance endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.api.schemas import DriverDocumentResponse, DriverMaintenanceResponse
from app.core.errors import DatabaseError
from app.core.logger import Logger
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


def _ensure_driver_access(user: User) -> None:
    if user.role != "driver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is available to drivers only",
        )


@router.get(
    "/documents",
    response_model=list[DriverDocumentResponse],
    status_code=status.HTTP_200_OK,
    summary="Get driver compliance documents",
)
async def get_driver_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[DriverDocumentResponse]:
    _ensure_driver_access(current_user)

    try:
        repository = DatabaseDriverRepository(db)
        use_case = GetDriverDocumentsUseCase(repository)
        documents = await use_case.execute(current_user.id)
        return [
            DriverDocumentResponse(
                title=document.title,
                expiryDate=document.expiry_date,
            )
            for document in documents
        ]
    except DatabaseError as exc:
        Logger.error(
            f"Failed to get driver documents for user {current_user.id}: {exc}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load driver documents",
        )


@router.get(
    "/maintenance",
    response_model=list[DriverMaintenanceResponse],
    status_code=status.HTTP_200_OK,
    summary="Get driver maintenance schedule",
)
async def get_driver_maintenance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[DriverMaintenanceResponse]:
    _ensure_driver_access(current_user)

    try:
        repository = DatabaseDriverRepository(db)
        use_case = GetDriverMaintenanceUseCase(repository)
        tasks = await use_case.execute(current_user.id)
        return [
            DriverMaintenanceResponse(
                title=task.title,
                date=task.date,
                status=task.status,  # type: ignore[arg-type]
            )
            for task in tasks
        ]
    except DatabaseError as exc:
        Logger.error(
            f"Failed to get driver maintenance for user {current_user.id}: {exc}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load maintenance schedule",
        )
