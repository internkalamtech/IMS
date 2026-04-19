"""
Fee structure endpoints.

Provides REST API endpoints for managing class-level fee structures including:
- Create fee structures with breakdown items and installments
- List fee structures with filters
- Update fee structures
- Delete fee structures
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.errors import DatabaseError, NotFoundError, ValidationError
from app.core.logger import Logger
from app.domain.entities.user import User
from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.database_payment_repository import (
    DatabasePaymentRepository,
)

router = APIRouter(prefix="/fee-structures", tags=["Fee Structures"])


# ------------------------------------------------------------------ #
# Schemas (inline for now)
# ------------------------------------------------------------------ #

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List as ListType


class FeeBreakdownCreate(BaseModel):
    """Schema for creating fee breakdown items."""

    fee_head: str = Field(..., description="Name of the fee head")
    amount: float = Field(..., gt=0, description="Amount for this fee head")
    description: Optional[str] = Field(None, description="Optional description")


class InstallmentScheduleCreate(BaseModel):
    """Schema for creating installment schedules."""

    installment_number: int = Field(
        ..., ge=1, description="Order of installment"
    )
    due_date: datetime = Field(..., description="Due date for installment")
    amount: float = Field(..., gt=0, description="Amount for installment")
    description: Optional[str] = Field(None, description="Optional description")


class ClassFeeStructureCreate(BaseModel):
    """Schema for creating a class fee structure."""

    class_name: str = Field(..., description="Name of the class")
    academic_year: str = Field(
        ..., description="Academic year (e.g., 2024-25)"
    )
    total_amount: float = Field(..., gt=0, description="Total fee amount")
    breakdowns: ListType[FeeBreakdownCreate] = Field(
        ..., description="Fee breakdown items"
    )
    installments: ListType[InstallmentScheduleCreate] = Field(
        ..., description="Installment schedules"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "class_name": "Grade 10",
                    "academic_year": "2024-25",
                    "total_amount": 50000.0,
                    "breakdowns": [
                        {
                            "fee_head": "Tuition",
                            "amount": 30000.0,
                            "description": "Monthly tuition fee",
                        },
                        {
                            "fee_head": "Transport",
                            "amount": 15000.0,
                            "description": "Annual transport fee",
                        },
                        {
                            "fee_head": "Lab",
                            "amount": 5000.0,
                            "description": "Lab access fee",
                        },
                    ],
                    "installments": [
                        {
                            "installment_number": 1,
                            "due_date": "2024-06-01T00:00:00",
                            "amount": 25000.0,
                            "description": "First installment",
                        },
                        {
                            "installment_number": 2,
                            "due_date": "2024-09-01T00:00:00",
                            "amount": 25000.0,
                            "description": "Second installment",
                        },
                    ],
                }
            ]
        }
    }


class ClassFeeStructureUpdate(BaseModel):
    """Schema for updating a class fee structure."""

    class_name: Optional[str] = Field(None, description="New class name")
    academic_year: Optional[str] = Field(None, description="New academic year")
    total_amount: Optional[float] = Field(
        None, gt=0, description="New total amount"
    )
    breakdowns: Optional[ListType[FeeBreakdownCreate]] = Field(
        None, description="Updated breakdowns"
    )
    installments: Optional[ListType[InstallmentScheduleCreate]] = Field(
        None, description="Updated installments"
    )


class FeeBreakdownResponse(BaseModel):
    """Response schema for fee breakdown."""

    id: int
    class_fee_structure_id: int
    fee_head: str
    amount: float
    description: Optional[str] = None

    model_config = {"from_attributes": True}


class InstallmentScheduleResponse(BaseModel):
    """Response schema for installment schedule."""

    id: int
    class_fee_structure_id: int
    installment_number: int
    due_date: datetime
    amount: float
    description: Optional[str] = None

    model_config = {"from_attributes": True}


class ClassFeeStructureResponse(BaseModel):
    """Response schema for class fee structure."""

    id: int
    class_name: str
    academic_year: str
    total_amount: float
    created_at: datetime
    updated_at: datetime
    breakdowns: ListType[FeeBreakdownResponse]
    installments: ListType[InstallmentScheduleResponse]

    model_config = {"from_attributes": True}


class ErrorResponse(BaseModel):
    """Error response schema."""

    detail: str


# ------------------------------------------------------------------ #
# Endpoints
# ------------------------------------------------------------------ #


@router.post(
    "/",
    response_model=ClassFeeStructureResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Create fee structure",
    description="Create a new class-level fee structure with breakdown items and installment schedules.",
)
async def create_fee_structure(
    request: ClassFeeStructureCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ClassFeeStructureResponse:
    """
    Create a new class fee structure.

    Args:
        request: Fee structure creation payload
        db: Database session (injected)
        current_user: Authenticated user (injected)

    Returns:
        ClassFeeStructureResponse with created structure details

    Raises:
        HTTPException 400: If validation fails
        HTTPException 500: If an unexpected error occurs
    """
    try:
        Logger.info(
            f"Fee structure creation requested by user={current_user.id} "
            f"for class={request.class_name}"
        )
        repository = DatabasePaymentRepository(db)

        # Convert breakdown and installment requests to dicts
        breakdowns_dict = [bd.model_dump() for bd in request.breakdowns]
        installments_dict = [i.model_dump() for i in request.installments]

        structure = await repository.create_class_fee_structure(
            class_name=request.class_name,
            academic_year=request.academic_year,
            total_amount=request.total_amount,
            breakdowns=breakdowns_dict,
            installments=installments_dict,
        )
        Logger.info(f"Fee structure created: id={structure.id}")

        return ClassFeeStructureResponse(
            id=structure.id,
            class_name=structure.class_name,
            academic_year=structure.academic_year,
            total_amount=structure.total_amount,
            created_at=structure.created_at,
            updated_at=structure.updated_at,
            breakdowns=[
                FeeBreakdownResponse(
                    id=bd.id,
                    class_fee_structure_id=bd.class_fee_structure_id,
                    fee_head=bd.fee_head,
                    amount=bd.amount,
                    description=bd.description,
                )
                for bd in structure.breakdowns or []
            ],
            installments=[
                InstallmentScheduleResponse(
                    id=i.id,
                    class_fee_structure_id=i.class_fee_structure_id,
                    installment_number=i.installment_number,
                    due_date=i.due_date,
                    amount=i.amount,
                    description=i.description,
                )
                for i in structure.installments or []
            ],
        )
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=exc.message
        )
    except DatabaseError as exc:
        Logger.error(f"Database error while creating fee structure: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the fee structure.",
        )


@router.get(
    "/",
    response_model=List[ClassFeeStructureResponse],
    status_code=status.HTTP_200_OK,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="List fee structures",
    description="Retrieve a list of class fee structures with optional filters.",
)
async def list_fee_structures(
    class_name: Optional[str] = Query(None, description="Filter by class name"),
    academic_year: Optional[str] = Query(
        None, description="Filter by academic year"
    ),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[ClassFeeStructureResponse]:
    """
    List class fee structures with optional filters.

    Args:
        class_name: Optional filter by class name
        academic_year: Optional filter by academic year
        db: Database session (injected)
        current_user: Authenticated user (injected)

    Returns:
        List of ClassFeeStructureResponse objects
    """
    try:
        repository = DatabasePaymentRepository(db)
        structures = await repository.list_class_fee_structures(
            class_name=class_name,
            academic_year=academic_year,
        )
        return [
            ClassFeeStructureResponse(
                id=s.id,
                class_name=s.class_name,
                academic_year=s.academic_year,
                total_amount=s.total_amount,
                created_at=s.created_at,
                updated_at=s.updated_at,
                breakdowns=[
                    FeeBreakdownResponse(
                        id=bd.id,
                        class_fee_structure_id=bd.class_fee_structure_id,
                        fee_head=bd.fee_head,
                        amount=bd.amount,
                        description=bd.description,
                    )
                    for bd in s.breakdowns or []
                ],
                installments=[
                    InstallmentScheduleResponse(
                        id=i.id,
                        class_fee_structure_id=i.class_fee_structure_id,
                        installment_number=i.installment_number,
                        due_date=i.due_date,
                        amount=i.amount,
                        description=i.description,
                    )
                    for i in s.installments or []
                ],
            )
            for s in structures
        ]
    except DatabaseError as exc:
        Logger.error(f"Database error while listing fee structures: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving fee structures.",
        )


@router.get(
    "/{structure_id}",
    response_model=ClassFeeStructureResponse,
    status_code=status.HTTP_200_OK,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        404: {"model": ErrorResponse, "description": "Fee structure not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Get fee structure by ID",
    description="Retrieve a single fee structure by its unique ID.",
)
async def get_fee_structure(
    structure_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ClassFeeStructureResponse:
    """
    Retrieve a fee structure by its ID.

    Args:
        structure_id: Unique identifier of the fee structure
        db: Database session (injected)
        current_user: Authenticated user (injected)

    Returns:
        ClassFeeStructureResponse for the requested structure

    Raises:
        HTTPException 404: If fee structure is not found
    """
    try:
        repository = DatabasePaymentRepository(db)
        structure = await repository.get_class_fee_structure_by_id(
            structure_id
        )
        if structure is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Fee structure with id {structure_id} not found.",
            )

        return ClassFeeStructureResponse(
            id=structure.id,
            class_name=structure.class_name,
            academic_year=structure.academic_year,
            total_amount=structure.total_amount,
            created_at=structure.created_at,
            updated_at=structure.updated_at,
            breakdowns=[
                FeeBreakdownResponse(
                    id=bd.id,
                    class_fee_structure_id=bd.class_fee_structure_id,
                    fee_head=bd.fee_head,
                    amount=bd.amount,
                    description=bd.description,
                )
                for bd in structure.breakdowns or []
            ],
            installments=[
                InstallmentScheduleResponse(
                    id=i.id,
                    class_fee_structure_id=i.class_fee_structure_id,
                    installment_number=i.installment_number,
                    due_date=i.due_date,
                    amount=i.amount,
                    description=i.description,
                )
                for i in structure.installments or []
            ],
        )
    except DatabaseError as exc:
        Logger.error(
            f"Database error while fetching fee structure {structure_id}: {exc}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving the fee structure.",
        )


@router.put(
    "/{structure_id}",
    response_model=ClassFeeStructureResponse,
    status_code=status.HTTP_200_OK,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        404: {"model": ErrorResponse, "description": "Fee structure not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Update fee structure",
    description="Update an existing class fee structure and its breakdown items and installments.",
)
async def update_fee_structure(
    structure_id: int,
    request: ClassFeeStructureUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ClassFeeStructureResponse:
    """
    Update a fee structure.

    Args:
        structure_id: ID of the fee structure to update
        request: Update payload
        db: Database session (injected)
        current_user: Authenticated user (injected)

    Returns:
        ClassFeeStructureResponse with updated details

    Raises:
        HTTPException 400: If validation fails
        HTTPException 404: If structure is not found
        HTTPException 500: If an unexpected error occurs
    """
    try:
        Logger.info(
            f"Fee structure update requested by user={current_user.id} "
            f"for structure={structure_id}"
        )
        repository = DatabasePaymentRepository(db)

        # Convert optional breakdown and installment requests to dicts
        breakdowns_dict = (
            [bd.model_dump() for bd in request.breakdowns]
            if request.breakdowns
            else None
        )
        installments_dict = (
            [i.model_dump() for i in request.installments]
            if request.installments
            else None
        )

        structure = await repository.update_class_fee_structure(
            structure_id=structure_id,
            class_name=request.class_name,
            academic_year=request.academic_year,
            total_amount=request.total_amount,
            breakdowns=breakdowns_dict,
            installments=installments_dict,
        )
        Logger.info(f"Fee structure updated: id={structure.id}")

        return ClassFeeStructureResponse(
            id=structure.id,
            class_name=structure.class_name,
            academic_year=structure.academic_year,
            total_amount=structure.total_amount,
            created_at=structure.created_at,
            updated_at=structure.updated_at,
            breakdowns=[
                FeeBreakdownResponse(
                    id=bd.id,
                    class_fee_structure_id=bd.class_fee_structure_id,
                    fee_head=bd.fee_head,
                    amount=bd.amount,
                    description=bd.description,
                )
                for bd in structure.breakdowns or []
            ],
            installments=[
                InstallmentScheduleResponse(
                    id=i.id,
                    class_fee_structure_id=i.class_fee_structure_id,
                    installment_number=i.installment_number,
                    due_date=i.due_date,
                    amount=i.amount,
                    description=i.description,
                )
                for i in structure.installments or []
            ],
        )
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=exc.message
        )
    except DatabaseError as exc:
        Logger.error(f"Database error while updating fee structure: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the fee structure.",
        )


@router.delete(
    "/{structure_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        404: {"model": ErrorResponse, "description": "Fee structure not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Delete fee structure",
    description="Delete a class fee structure and its related data.",
)
async def delete_fee_structure(
    structure_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Delete a fee structure.

    Args:
        structure_id: ID of the fee structure to delete
        db: Database session (injected)
        current_user: Authenticated user (injected)

    Raises:
        HTTPException 404: If structure is not found
        HTTPException 500: If an unexpected error occurs
    """
    try:
        Logger.info(
            f"Fee structure deletion requested by user={current_user.id} "
            f"for structure={structure_id}"
        )
        repository = DatabasePaymentRepository(db)
        await repository.delete_class_fee_structure(structure_id)
        Logger.info(f"Fee structure deleted: id={structure_id}")
    except DatabaseError as exc:
        Logger.error(f"Database error while deleting fee structure: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the fee structure.",
        )
