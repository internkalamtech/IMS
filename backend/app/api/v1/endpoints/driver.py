"""Driver maintenance and compliance endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.api.schemas import ComplianceDocumentResponse, MaintenanceTaskResponse
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


@router.get(
    "/documents",
    response_model=list[ComplianceDocumentResponse],
    status_code=status.HTTP_200_OK,
    summary="Get driver compliance documents",
)
async def get_driver_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ComplianceDocumentResponse]:
    """Return compliance documents for the authenticated driver's vehicle."""
    try:
        repository = DatabaseDriverRepository(db)
        use_case = GetDriverDocumentsUseCase(repository)
        documents = await use_case.execute(int(current_user.id))

        return [
            ComplianceDocumentResponse(
                title=document.title,
                expiryDate=document.expiry_date.isoformat(),
            )
            for document in documents
        ]
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except DatabaseError as exc:
        Logger.error(
            f"Database error while fetching driver documents: {exc.message}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=exc.message,
        ) from exc


@router.get(
    "/maintenance",
    response_model=list[MaintenanceTaskResponse],
    status_code=status.HTTP_200_OK,
    summary="Get driver maintenance tasks",
)
async def get_driver_maintenance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[MaintenanceTaskResponse]:
    """Return maintenance tasks for the authenticated driver's vehicle."""
    try:
        repository = DatabaseDriverRepository(db)
        use_case = GetDriverMaintenanceUseCase(repository)
        tasks = await use_case.execute(int(current_user.id))

        return [
            MaintenanceTaskResponse(
                title=task.title,
                date=task.scheduled_date.isoformat(),
                status=task.status,
            )
            for task in tasks
        ]
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except DatabaseError as exc:
        Logger.error(
            f"Database error while fetching driver maintenance: {exc.message}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=exc.message,
        ) from exc
