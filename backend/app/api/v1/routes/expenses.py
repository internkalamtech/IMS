"""
backend/app/api/v1/routes/expenses.py
PHASE_3: Expense Management API Routes
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import Optional
from app.api.schemas.expense_schema import (
    ExpenseCreateSchema,
    ExpenseResponseSchema,
    ExpenseListResponseSchema,
)
from app.api.dependencies import get_current_user
from app.core.logger import logger
from datetime import datetime

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("", response_model=ExpenseResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_expense(
    payload: ExpenseCreateSchema,
    current_user: dict = Depends(get_current_user),
):
    """Create a new expense"""
    try:
        logger.info(f"Creating expense: {payload.description}")
        
        return ExpenseResponseSchema(
            id="EXP_001",
            description=payload.description,
            amount=payload.amount,
            category=payload.category,
            status="pending",
            bill_number=payload.bill_number,
            vendor_name=payload.vendor_name,
            requested_by_id=current_user.get("id"),
            approval_date=None,
            payment_date=None,
            created_at=datetime.utcnow(),
        )
    except Exception as e:
        logger.error(f"Error creating expense: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=ExpenseListResponseSchema)
async def list_expenses(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    """List expenses with filtering"""
    try:
        return ExpenseListResponseSchema(total=0, items=[])
    except Exception as e:
        logger.error(f"Error listing expenses: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{expense_id}/approve", response_model=ExpenseResponseSchema)
async def approve_expense(
    expense_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Approve an expense"""
    try:
        logger.info(f"Approving expense: {expense_id}")
        raise HTTPException(status_code=404, detail="Expense not found")
    except Exception as e:
        logger.error(f"Error approving expense: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
