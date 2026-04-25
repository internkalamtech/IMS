"""
backend/app/api/v1/routes/budgets.py
PHASE_3: Budget Management API Routes
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from app.api.schemas.budget_schema import (
    BudgetCreateSchema,
    BudgetResponseSchema,
    BudgetListResponseSchema,
)
from app.api.dependencies import get_current_user
from app.core.logger import logger
from datetime import datetime

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.post("", response_model=BudgetResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_budget(
    payload: BudgetCreateSchema,
    current_user: dict = Depends(get_current_user),
):
    """Create a new budget"""
    try:
        logger.info(f"Creating budget for {payload.department}")
        
        # TODO: Integrate with repository
        return BudgetResponseSchema(
            id="BUDGET_001",
            academic_year=payload.academic_year,
            department=payload.department,
            total_budget=payload.total_budget,
            total_allocated=sum(h.allocated_amount for h in payload.budget_heads),
            total_spent=0,
            remaining_budget=payload.total_budget,
            status="draft",
            created_at=datetime.utcnow(),
        )
    except Exception as e:
        logger.error(f"Error creating budget: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=BudgetListResponseSchema)
async def list_budgets(
    academic_year: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    """List all budgets"""
    try:
        return BudgetListResponseSchema(total=0, items=[])
    except Exception as e:
        logger.error(f"Error listing budgets: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{budget_id}/approve", response_model=BudgetResponseSchema)
async def approve_budget(
    budget_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Approve a budget"""
    try:
        logger.info(f"Approving budget: {budget_id}")
        raise HTTPException(status_code=404, detail="Budget not found")
    except Exception as e:
        logger.error(f"Error approving budget: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
