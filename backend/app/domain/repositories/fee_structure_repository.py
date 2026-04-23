"""
backend/app/domain/repositories/fee_structure_repository.py
STORY_FEE_BREAKDOWN_BACKEND - Fee Structure Repository Pattern
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from app.domain.entities.fee_structure import FeeStructure, FeeHead, Installment


class FeeStructureRepository(ABC):
    """
    Abstract repository for Fee Structure data access.
    Defines the contract for data operations.
    """
    
    @abstractmethod
    async def create(self, fee_structure: FeeStructure) -> FeeStructure:
        """Create a new fee structure in the database"""
        pass
    
    @abstractmethod
    async def get_by_id(self, fee_structure_id: str) -> Optional[FeeStructure]:
        """Fetch a fee structure by ID"""
        pass
    
    @abstractmethod
    async def list(
        self,
        organization_id: str,
        branch_id: Optional[str] = None,
        class_name: Optional[str] = None,
        academic_year: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[List[FeeStructure], int]:
        """
        List fee structures with filtering and pagination.
        Returns: (list of structures, total count)
        """
        pass
    
    @abstractmethod
    async def update(self, fee_structure_id: str, data: Dict[str, Any]) -> Optional[FeeStructure]:
        """Update a fee structure"""
        pass
    
    @abstractmethod
    async def delete(self, fee_structure_id: str) -> bool:
        """Soft delete a fee structure"""
        pass
    
    @abstractmethod
    async def check_uniqueness(
        self,
        class_name: str,
        academic_year: str,
        organization_id: str,
        exclude_id: Optional[str] = None
    ) -> bool:
        """
        Check if a class+academic_year combination is unique.
        Returns: True if unique, False otherwise
        """
        pass
    
    @abstractmethod
    async def get_by_class_and_year(
        self,
        class_id: str,
        academic_year: str,
        organization_id: str
    ) -> Optional[FeeStructure]:
        """Get fee structure for a specific class and academic year"""
        pass
    
    @abstractmethod
    async def get_active_for_class(
        self,
        class_id: str,
        organization_id: str
    ) -> Optional[FeeStructure]:
        """Get the currently active fee structure for a class"""
        pass
