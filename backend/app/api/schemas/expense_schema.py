"""
backend/app/api/schemas/expense_schema.py
PHASE_3: Expense Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ExpenseCreateSchema(BaseModel):
    description: str
    amount: float = Field(gt=0)
    category: str
    budget_head_id: str
    department: str
    bill_number: Optional[str] = None
    vendor_name: Optional[str] = None
    notes: Optional[str] = None


class ExpenseResponseSchema(BaseModel):
    id: str
    description: str
    amount: float
    category: str
    status: str
    bill_number: Optional[str]
    vendor_name: Optional[str]
    requested_by_id: Optional[str]
    approval_date: Optional[datetime]
    payment_date: Optional[datetime]
    created_at: datetime


class ExpenseListResponseSchema(BaseModel):
    total: int
    items: list[ExpenseResponseSchema]
