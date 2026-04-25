"""
backend/app/domain/entities/budget_entity.py
PHASE_3: Admin Finance - Budget Entity
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional, List


class BudgetStatus(str, Enum):
    DRAFT = "draft"
    APPROVED = "approved"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


@dataclass
class BudgetHead:
    """Individual budget line item"""
    name: str
    allocated_amount: float
    spent_amount: float = 0.0
    description: Optional[str] = None
    
    def get_balance(self) -> float:
        return self.allocated_amount - self.spent_amount
    
    def get_utilization_percent(self) -> float:
        if self.allocated_amount == 0:
            return 0.0
        return (self.spent_amount / self.allocated_amount) * 100


@dataclass
class BudgetEntity:
    """Budget for a department/school"""
    id: str
    academic_year: str
    department: str
    total_budget: float
    budget_heads: List[BudgetHead] = field(default_factory=list)
    status: BudgetStatus = BudgetStatus.DRAFT
    approved_by_id: Optional[str] = None
    approval_date: Optional[datetime] = None
    created_by_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    notes: Optional[str] = None
    is_deleted: bool = False
    
    def get_total_allocated(self) -> float:
        return sum(head.allocated_amount for head in self.budget_heads)
    
    def get_total_spent(self) -> float:
        return sum(head.spent_amount for head in self.budget_heads)
    
    def get_remaining_budget(self) -> float:
        return self.total_budget - self.get_total_spent()
    
    def validate(self) -> None:
        if not self.academic_year:
            raise ValueError("Academic year is required")
        if self.total_budget <= 0:
            raise ValueError("Total budget must be positive")
        if self.get_total_allocated() > self.total_budget:
            raise ValueError("Sum of allocated budgets exceeds total budget")
