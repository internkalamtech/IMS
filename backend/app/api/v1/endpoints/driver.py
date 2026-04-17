<<<<<<< HEAD
"""Driver compliance and maintenance endpoints."""
=======
"""Driver maintenance and compliance endpoints."""
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
<<<<<<< HEAD
from app.api.schemas import DriverDocumentResponse, DriverMaintenanceResponse
=======
from app.api.schemas import ComplianceDocumentResponse, MaintenanceTaskResponse
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
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


<<<<<<< HEAD
def _ensure_driver_access(user: User) -> None:
    if user.role != "driver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is available to drivers only",
        )


@router.get(
    "/documents",
    response_model=list[DriverDocumentResponse],
=======
@router.get(
    "/documents",
    response_model=list[ComplianceDocumentResponse],
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
    status_code=status.HTTP_200_OK,
    summary="Get driver compliance documents",
)
async def get_driver_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
<<<<<<< HEAD
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
=======
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
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
<<<<<<< HEAD
            detail="Failed to load driver documents",
        )
=======
            detail=exc.message,
        ) from exc
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89


@router.get(
    "/maintenance",
<<<<<<< HEAD
    response_model=list[DriverMaintenanceResponse],
    status_code=status.HTTP_200_OK,
    summary="Get driver maintenance schedule",
=======
    response_model=list[MaintenanceTaskResponse],
    status_code=status.HTTP_200_OK,
    summary="Get driver maintenance tasks",
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
)
async def get_driver_maintenance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
<<<<<<< HEAD
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
=======
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
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
<<<<<<< HEAD
            detail="Failed to load maintenance schedule",
        )
=======
            detail=exc.message,
        ) from exc
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
