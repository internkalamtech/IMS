"""
backend/app/domain/entities/expense_entity.py
PHASE_3: Admin Finance - Expense Entity
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional


class ExpenseCategory(str, Enum):
    SALARY = "salary"
    UTILITIES = "utilities"
    MAINTENANCE = "maintenance"
    SUPPLIES = "supplies"
    TRANSPORT = "transport"
    MEDICAL = "medical"
    FOOD = "food"
    ADMIN = "admin"
    OTHER = "other"


class ExpenseStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    PAID = "paid"
    REJECTED = "rejected"


@dataclass
class ExpenseEntity:
    """Expense tracking entity"""
    id: str
    description: str
    amount: float
    category: ExpenseCategory
    budget_head_id: str
    department: str
    status: ExpenseStatus = ExpenseStatus.PENDING
    bill_number: Optional[str] = None
    vendor_name: Optional[str] = None
    requested_by_id: Optional[str] = None
    approved_by_id: Optional[str] = None
    approval_date: Optional[datetime] = None
    payment_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    notes: Optional[str] = None
    attachment_url: Optional[str] = None
    is_deleted: bool = False
    
    def validate(self) -> None:
        if self.amount <= 0:
            raise ValueError("Amount must be positive")
        if not self.description:
            raise ValueError("Description is required")
        if not self.category:
            raise ValueError("Category is required")
