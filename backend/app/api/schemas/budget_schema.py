"""
backend/app/api/schemas/budget_schema.py
PHASE_3: Budget Schemas
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class BudgetHeadSchema(BaseModel):
    name: str
    allocated_amount: float = Field(gt=0)
    description: Optional[str] = None


class BudgetCreateSchema(BaseModel):
    academic_year: str
    department: str
    total_budget: float = Field(gt=0)
    budget_heads: List[BudgetHeadSchema]
    notes: Optional[str] = None


class BudgetResponseSchema(BaseModel):
    id: str
    academic_year: str
    department: str
    total_budget: float
    total_allocated: float
    total_spent: float
    remaining_budget: float
    status: str
    created_at: datetime


class BudgetListResponseSchema(BaseModel):
    total: int
    items: List[BudgetResponseSchema]
