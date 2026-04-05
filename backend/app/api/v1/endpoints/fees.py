"""
Fee structure endpoints.

Provides CRUD operations for fee structures, fee items, and installment plans.
"""

import re
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.schemas import (
    FeeStructureCreate,
    FeeStructureResponse,
    FeeStructureUpdate,
    FeeItemResponse,
    InstallmentPlanResponse,
)
from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import (
    ClassSectionModel,
    FeeItemModel,
    FeeStructureModel,
    InstallmentPlanModel,
)

router = APIRouter(prefix="/fees", tags=["Fees"])


def _escape_like(value: str) -> str:
    """Escape special LIKE/ILIKE pattern characters (%, _, \\) in a search string."""
    return re.sub(r"([%_\\])", r"\\\1", value)


def _build_response(structure: FeeStructureModel) -> FeeStructureResponse:
    """Convert a FeeStructureModel ORM instance to a FeeStructureResponse."""
    class_name: Optional[str] = None
    if structure.class_section is not None:
        class_name = structure.class_section.name

    return FeeStructureResponse(
        id=structure.id,
        class_id=structure.class_id,
        class_name=class_name,
        academic_year=structure.academic_year,
        total_amount=float(structure.total_amount),
        items=[
            FeeItemResponse(
                id=item.id,
                head_name=item.head_name,
                amount=float(item.amount),
            )
            for item in structure.items
        ],
        installments=[
            InstallmentPlanResponse(
                id=inst.id,
                due_date=inst.due_date,
                amount=float(inst.amount),
            )
            for inst in structure.installments
        ],
    )


@router.get(
    "",
    response_model=List[FeeStructureResponse],
    status_code=status.HTTP_200_OK,
    summary="List fee structures",
    description="Retrieve all fee structures, optionally filtered by class name.",
)
async def list_fee_structures(
    class_name: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
) -> List[FeeStructureResponse]:
    """List all fee structures with optional filtering by class name."""
    query = (
        select(FeeStructureModel)
        .options(
            selectinload(FeeStructureModel.class_section),
            selectinload(FeeStructureModel.items),
            selectinload(FeeStructureModel.installments),
        )
        .join(ClassSectionModel, FeeStructureModel.class_id == ClassSectionModel.id)
    )

    if class_name:
        query = query.where(ClassSectionModel.name.ilike(f"%{_escape_like(class_name)}%"))

    result = await db.execute(query)
    structures = result.scalars().all()
    return [_build_response(s) for s in structures]


@router.post(
    "",
    response_model=FeeStructureResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a fee structure",
    description="Create a new fee structure with fee items and optional installment plans.",
)
async def create_fee_structure(
    data: FeeStructureCreate,
    db: AsyncSession = Depends(get_db),
) -> FeeStructureResponse:
    """Create a new fee structure."""
    # Verify class exists
    class_result = await db.execute(
        select(ClassSectionModel).where(ClassSectionModel.id == data.class_id)
    )
    class_section = class_result.scalar_one_or_none()
    if class_section is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Class with id {data.class_id} not found.",
        )

    structure = FeeStructureModel(
        class_id=data.class_id,
        academic_year=data.academic_year,
        total_amount=data.total_amount,
    )
    db.add(structure)
    await db.flush()  # get structure.id before creating children

    for item in data.items:
        db.add(
            FeeItemModel(
                structure_id=structure.id,
                head_name=item.head_name,
                amount=item.amount,
            )
        )

    for inst in data.installments:
        db.add(
            InstallmentPlanModel(
                structure_id=structure.id,
                due_date=inst.due_date,
                amount=inst.amount,
            )
        )

    await db.commit()

    # Reload with relationships
    reload_result = await db.execute(
        select(FeeStructureModel)
        .options(
            selectinload(FeeStructureModel.class_section),
            selectinload(FeeStructureModel.items),
            selectinload(FeeStructureModel.installments),
        )
        .where(FeeStructureModel.id == structure.id)
    )
    structure = reload_result.scalar_one()
    return _build_response(structure)


@router.put(
    "/{structure_id}",
    response_model=FeeStructureResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a fee structure",
    description="Update an existing fee structure. Providing 'items' replaces all existing items.",
)
async def update_fee_structure(
    structure_id: int,
    data: FeeStructureUpdate,
    db: AsyncSession = Depends(get_db),
) -> FeeStructureResponse:
    """Update an existing fee structure."""
    result = await db.execute(
        select(FeeStructureModel)
        .options(
            selectinload(FeeStructureModel.class_section),
            selectinload(FeeStructureModel.items),
            selectinload(FeeStructureModel.installments),
        )
        .where(FeeStructureModel.id == structure_id)
    )
    structure = result.scalar_one_or_none()
    if structure is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fee structure with id {structure_id} not found.",
        )

    if data.class_id is not None:
        class_result = await db.execute(
            select(ClassSectionModel).where(ClassSectionModel.id == data.class_id)
        )
        if class_result.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Class with id {data.class_id} not found.",
            )
        structure.class_id = data.class_id

    if data.academic_year is not None:
        structure.academic_year = data.academic_year

    if data.items is not None:
        # Bulk-delete existing items then insert new ones
        await db.execute(delete(FeeItemModel).where(FeeItemModel.structure_id == structure.id))
        await db.flush()
        for new_item in data.items:
            db.add(
                FeeItemModel(
                    structure_id=structure.id,
                    head_name=new_item.head_name,
                    amount=new_item.amount,
                )
            )
        structure.total_amount = data.total_amount

    if data.installments is not None:
        # Bulk-delete existing installments then insert new ones
        await db.execute(
            delete(InstallmentPlanModel).where(InstallmentPlanModel.structure_id == structure.id)
        )
        await db.flush()
        for new_inst in data.installments:
            db.add(
                InstallmentPlanModel(
                    structure_id=structure.id,
                    due_date=new_inst.due_date,
                    amount=new_inst.amount,
                )
            )

    await db.commit()

    # Reload with relationships
    reload_result = await db.execute(
        select(FeeStructureModel)
        .options(
            selectinload(FeeStructureModel.class_section),
            selectinload(FeeStructureModel.items),
            selectinload(FeeStructureModel.installments),
        )
        .where(FeeStructureModel.id == structure_id)
    )
    structure = reload_result.scalar_one()
    return _build_response(structure)


@router.delete(
    "/{structure_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a fee structure",
    description="Delete a fee structure and all associated fee items and installments.",
)
async def delete_fee_structure(
    structure_id: int,
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a fee structure and cascade-delete its items and installments."""
    result = await db.execute(select(FeeStructureModel).where(FeeStructureModel.id == structure_id))
    structure = result.scalar_one_or_none()
    if structure is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fee structure with id {structure_id} not found.",
        )

    await db.delete(structure)
    await db.commit()
