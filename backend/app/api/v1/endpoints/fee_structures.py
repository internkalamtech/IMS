"""
Fee Structure endpoints.

This module provides API endpoints for fee structure management,
including creating, retrieving, updating, and deleting fee structures
with their associated fee heads and installments.
"""

from fastapi import APIRouter, Body, Depends, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas import (
    FeeStructureCreate,
    FeeStructureResponse,
    FeeStructureUpdate,
)
from app.core.errors import NotFoundError, ValidationError
from app.core.logger import Logger
from app.domain.usecases.payment_usecases import (
    CreateFeeStructureUseCase,
    DeleteFeeStructureUseCase,
    GetFeeStructureUseCase,
    UpdateFeeStructureUseCase,
)
from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.database_fee_structure_repository import (
    DatabaseFeeStructureRepository,
)

router = APIRouter(prefix="/fee-structures", tags=["Fee Structures"])


@router.post(
    "/",
    response_model=FeeStructureResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a fee structure",
    description="Create a new fee structure with fee heads and "
    "installments for a class.",
)
async def create_fee_structure(
    fee_structure: FeeStructureCreate,
    db: AsyncSession = Depends(get_db),
) -> FeeStructureResponse:
    """
    Create a new fee structure endpoint.

    Accepts a fee structure with fee heads and installments,
    and stores them in the database.
    """
    repository = DatabaseFeeStructureRepository(db)
    use_case = CreateFeeStructureUseCase(repository)

    try:
        result = await use_case.execute(
            class_id=fee_structure.class_id,
            academic_year=fee_structure.academic_year,
            total_fee=fee_structure.total_fee,
            fee_heads=[head.model_dump() for head in fee_structure.fee_heads],
            installments=[
                inst.model_dump() for inst in fee_structure.installments
            ],
        )
    except ValueError as e:
        raise ValidationError(str(e))

    Logger.info(
        f"Fee structure created: id={result.id}, class_id={result.class_id}, "
        f"academic_year={result.academic_year}"
    )
    return FeeStructureResponse(
        id=result.id,
        class_id=result.class_id,
        academic_year=result.academic_year,
        total_fee=result.total_fee,
        fee_heads=[
            {
                "id": head.id,
                "name": head.name,
                "description": head.description,
                "amount": head.amount,
                "percentage": head.percentage,
            }
            for head in result.fee_heads
        ],
        installments=[
            {
                "id": inst.id,
                "installment_number": inst.installment_number,
                "due_date": inst.due_date,
                "amount": inst.amount,
                "description": inst.description,
            }
            for inst in result.installments
        ],
        created_at=result.created_at,
        updated_at=result.updated_at,
    )


@router.put(
    "/{fee_structure_id}",
    response_model=FeeStructureResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a fee structure",
    description="Update total fee, fee heads, or installments "
    "for an existing fee structure.",
)
async def update_fee_structure(
    fee_structure_id: str = Path(
        ..., description="ID of the fee structure to update"
    ),
    fee_structure_update: FeeStructureUpdate | None = Body(default=None),
    db: AsyncSession = Depends(get_db),
) -> FeeStructureResponse:
    """
    Update a fee structure endpoint.

    Updates fee structure details including total fee, fee heads, or
    installments.
    """
    if fee_structure_update is None:
        fee_structure_update = FeeStructureUpdate()

    repository = DatabaseFeeStructureRepository(db)
    use_case = UpdateFeeStructureUseCase(repository)

    try:
        result = await use_case.execute(
            fee_structure_id=fee_structure_id,
            total_fee=fee_structure_update.total_fee,
            fee_heads=(
                [head.model_dump() for head in fee_structure_update.fee_heads]
                if fee_structure_update.fee_heads is not None
                else None
            ),
            installments=(
                [
                    inst.model_dump()
                    for inst in fee_structure_update.installments
                ]
                if fee_structure_update.installments is not None
                else None
            ),
        )
    except ValueError as e:
        raise ValidationError(str(e))

    Logger.info(f"Fee structure updated: id={result.id}")
    return FeeStructureResponse(
        id=result.id,
        class_id=result.class_id,
        academic_year=result.academic_year,
        total_fee=result.total_fee,
        fee_heads=[
            {
                "id": head.id,
                "name": head.name,
                "description": head.description,
                "amount": head.amount,
                "percentage": head.percentage,
            }
            for head in result.fee_heads
        ],
        installments=[
            {
                "id": inst.id,
                "installment_number": inst.installment_number,
                "due_date": inst.due_date,
                "amount": inst.amount,
                "description": inst.description,
            }
            for inst in result.installments
        ],
        created_at=result.created_at,
        updated_at=result.updated_at,
    )


@router.get(
    "/class/{class_id}/academic-year/{academic_year}",
    response_model=FeeStructureResponse,
    status_code=status.HTTP_200_OK,
    summary="Get fee structure by class and academic year",
    description="Retrieve a fee structure for a specific class "
    "and academic year.",
    responses={404: {"description": "Fee structure not found"}},
)
async def get_fee_structure_by_class_and_year(
    class_id: int = Path(..., gt=0, description="ID of the class"),
    academic_year: str = Path(..., min_length=1, description="Academic year"),
    db: AsyncSession = Depends(get_db),
) -> FeeStructureResponse:
    """
    Get fee structure by class and academic year endpoint.

    Returns the fee structure with all its fee heads and installments.
    Raises 404 if no fee structure exists for the given class/year.
    """
    repository = DatabaseFeeStructureRepository(db)
    use_case = GetFeeStructureUseCase(repository)

    try:
        result = await use_case.execute_by_class_and_year(
            class_id=class_id,
            academic_year=academic_year,
        )
    except ValueError as e:
        raise ValidationError(str(e))

    if not result:
        raise NotFoundError(
            f"Fee structure not found for class {class_id} "
            f"and year {academic_year}"
        )

    return FeeStructureResponse(
        id=result.id,
        class_id=result.class_id,
        academic_year=result.academic_year,
        total_fee=result.total_fee,
        fee_heads=[
            {
                "id": head.id,
                "name": head.name,
                "description": head.description,
                "amount": head.amount,
                "percentage": head.percentage,
            }
            for head in result.fee_heads
        ],
        installments=[
            {
                "id": inst.id,
                "installment_number": inst.installment_number,
                "due_date": inst.due_date,
                "amount": inst.amount,
                "description": inst.description,
            }
            for inst in result.installments
        ],
        created_at=result.created_at,
        updated_at=result.updated_at,
    )


@router.get(
    "/class/{class_id}",
    response_model=list[FeeStructureResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all fee structures for a class",
    description="Retrieve all fee structures for a specific class.",
)
async def get_fee_structures_by_class(
    class_id: int = Path(..., gt=0, description="ID of the class"),
    db: AsyncSession = Depends(get_db),
) -> list[FeeStructureResponse]:
    """
    Get fee structures by class endpoint.

    Returns all fee structures for the class ordered by academic year.
    """
    repository = DatabaseFeeStructureRepository(db)
    use_case = GetFeeStructureUseCase(repository)

    try:
        results = await use_case.execute_by_class(class_id=class_id)
    except ValueError as e:
        raise ValidationError(str(e))

    return [
        FeeStructureResponse(
            id=result.id,
            class_id=result.class_id,
            academic_year=result.academic_year,
            total_fee=result.total_fee,
            fee_heads=[
                {
                    "id": head.id,
                    "name": head.name,
                    "description": head.description,
                    "amount": head.amount,
                    "percentage": head.percentage,
                }
                for head in result.fee_heads
            ],
            installments=[
                {
                    "id": inst.id,
                    "installment_number": inst.installment_number,
                    "due_date": inst.due_date,
                    "amount": inst.amount,
                    "description": inst.description,
                }
                for inst in result.installments
            ],
            created_at=result.created_at,
            updated_at=result.updated_at,
        )
        for result in results
    ]


@router.get(
    "/{fee_structure_id}",
    response_model=FeeStructureResponse,
    status_code=status.HTTP_200_OK,
    summary="Get fee structure by ID",
    description="Retrieve a fee structure by its unique identifier.",
    responses={404: {"description": "Fee structure not found"}},
)
async def get_fee_structure_by_id(
    fee_structure_id: str = Path(
        ..., description="ID of the fee structure"
    ),
    db: AsyncSession = Depends(get_db),
) -> FeeStructureResponse:
    """
    Get fee structure by ID endpoint.

    Returns the fee structure with all its fee heads and installments.
    Raises 404 if the fee structure does not exist.
    """
    repository = DatabaseFeeStructureRepository(db)
    use_case = GetFeeStructureUseCase(repository)

    try:
        result = await use_case.execute_by_id(
            fee_structure_id=fee_structure_id
        )
    except ValueError as e:
        raise ValidationError(str(e))

    if not result:
        raise NotFoundError(
            f"Fee structure with id {fee_structure_id} not found"
        )

    return FeeStructureResponse(
        id=result.id,
        class_id=result.class_id,
        academic_year=result.academic_year,
        total_fee=result.total_fee,
        fee_heads=[
            {
                "id": head.id,
                "name": head.name,
                "description": head.description,
                "amount": head.amount,
                "percentage": head.percentage,
            }
            for head in result.fee_heads
        ],
        installments=[
            {
                "id": inst.id,
                "installment_number": inst.installment_number,
                "due_date": inst.due_date,
                "amount": inst.amount,
                "description": inst.description,
            }
            for inst in result.installments
        ],
        created_at=result.created_at,
        updated_at=result.updated_at,
    )


@router.delete(
    "/{fee_structure_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a fee structure",
    description="Delete a fee structure with data integrity checks "
    "for student records.",
)
async def delete_fee_structure(
    fee_structure_id: str = Path(
        ..., description="ID of the fee structure to delete"
    ),
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Delete a fee structure endpoint.

    Removes a fee structure and ensures data integrity with student records.
    """
    repository = DatabaseFeeStructureRepository(db)
    use_case = DeleteFeeStructureUseCase(repository)

    try:
        await use_case.execute(fee_structure_id=fee_structure_id)
    except ValueError as e:
        raise ValidationError(str(e))

    Logger.info(f"Fee structure deleted: id={fee_structure_id}")
