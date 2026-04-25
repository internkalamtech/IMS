"""
backend/app/domain/repositories/expense_repository.py
PHASE_3: Expense Repository Pattern
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from app.domain.entities.expense_entity import ExpenseEntity


class ExpenseRepository(ABC):
    """Abstract repository for Expense data access"""
    
    @abstractmethod
    async def create(self, entity: ExpenseEntity) -> ExpenseEntity:
        pass
    
    @abstractmethod
    async def get_by_id(self, expense_id: str) -> Optional[ExpenseEntity]:
        pass
    
    @abstractmethod
    async def list_by_budget(
        self, budget_head_id: str, skip: int = 0, limit: int = 50
    ) -> tuple[List[ExpenseEntity], int]:
        pass
    
    @abstractmethod
    async def list_by_status(
        self, status: str, skip: int = 0, limit: int = 50
    ) -> tuple[List[ExpenseEntity], int]:
        pass
    
    @abstractmethod
    async def update(self, expense_id: str, data: Dict[str, Any]) -> Optional[ExpenseEntity]:
        pass
    
    @abstractmethod
    async def approve(self, expense_id: str, approved_by_id: str) -> Optional[ExpenseEntity]:
        pass
