"""
backend/app/domain/entities/fee_structure.py
STORY_FEE_BREAKDOWN_BACKEND - Fee Structure Entity Model
"""

from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime
from decimal import Decimal


@dataclass
class FeeHead:
    """Represents a single fee head (e.g., Tuition, Transport, Lab)"""
    name: str
    amount: Decimal
    description: Optional[str] = None
    
    def __post_init__(self):
        if isinstance(self.amount, (int, float)):
            self.amount = Decimal(str(self.amount))


@dataclass
class Installment:
    """Represents a payment installment plan"""
    installment_number: int
    due_date: str  # ISO format: YYYY-MM-DD
    amount: Decimal
    description: Optional[str] = None
    
    def __post_init__(self):
        if isinstance(self.amount, (int, float)):
            self.amount = Decimal(str(self.amount))


@dataclass
class FeeStructure:
    """
    Represents a fee structure for a class in a specific academic year.
    
    A fee structure defines:
    - Class it applies to
    - Academic year it's valid for
    - Breakdown of fees by head (Tuition, Transport, Lab, etc.)
    - Installment schedule for payment
    """
    id: Optional[str] = None
    class_id: Optional[str] = None
    class_name: str = ""
    academic_year: str = ""
    fee_heads: List[FeeHead] = field(default_factory=list)
    installment_plans: List[Installment] = field(default_factory=list)
    total_amount: Optional[Decimal] = None
    organization_id: Optional[str] = None
    branch_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_deleted: bool = False
    
    def calculate_total(self) -> Decimal:
        """Calculate total fee amount from all fee heads"""
        total = sum(head.amount for head in self.fee_heads)
        self.total_amount = total
        return total
    
    def validate(self) -> tuple[bool, Optional[str]]:
        """
        Validate fee structure data
        Returns: (is_valid, error_message)
        """
        if not self.class_name or not self.class_name.strip():
            return False, "Class name is required"
        
        if not self.academic_year or not self.academic_year.strip():
            return False, "Academic year is required"
        
        if not self.fee_heads:
            return False, "At least one fee head is required"
        
        if not self.installment_plans:
            return False, "At least one installment plan is required"
        
        # Validate fee head amounts are positive
        for head in self.fee_heads:
            if head.amount <= 0:
                return False, f"Fee head '{head.name}' amount must be positive"
        
        # Validate installment amounts sum to total
        total_installments = sum(plan.amount for plan in self.installment_plans)
        total_fees = self.calculate_total()
        
        if total_installments != total_fees:
            return False, f"Installment total (₹{total_installments}) must equal fee total (₹{total_fees})"
        
        return True, None
