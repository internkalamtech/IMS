"""
backend/app/domain/repositories/budget_repository.py
PHASE_3: Budget Repository Pattern
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from app.domain.entities.budget_entity import BudgetEntity


class BudgetRepository(ABC):
    """Abstract repository for Budget data access"""
    
    @abstractmethod
    async def create(self, entity: BudgetEntity) -> BudgetEntity:
        pass
    
    @abstractmethod
    async def get_by_id(self, budget_id: str) -> Optional[BudgetEntity]:
        pass
    
    @abstractmethod
    async def list_by_year(
        self, academic_year: str, skip: int = 0, limit: int = 50
    ) -> tuple[List[BudgetEntity], int]:
        pass
    
    @abstractmethod
    async def update(self, budget_id: str, data: Dict[str, Any]) -> Optional[BudgetEntity]:
        pass
    
    @abstractmethod
    async def approve(self, budget_id: str, approved_by_id: str) -> Optional[BudgetEntity]:
        pass
