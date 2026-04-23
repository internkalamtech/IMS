"""
backend/app/domain/repositories/class_repository.py
STORY_CLASS_CREATE_API - Class Repository Pattern
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from app.domain.entities.class_entity import ClassEntity


class ClassRepository(ABC):
    """
    Abstract repository for Class data access.
    Defines the contract for class CRUD operations.
    """
    
    @abstractmethod
    async def create(self, class_entity: ClassEntity) -> ClassEntity:
        """Create a new class"""
        pass
    
    @abstractmethod
    async def get_by_id(self, class_id: str) -> Optional[ClassEntity]:
        """Fetch a class by ID"""
        pass
    
    @abstractmethod
    async def list(
        self,
        organization_id: str,
        branch_id: Optional[str] = None,
        academic_year: Optional[str] = None,
        class_name: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[List[ClassEntity], int]:
        """
        List classes with filtering and pagination.
        Returns: (list of classes, total count)
        """
        pass
    
    @abstractmethod
    async def update(self, class_id: str, data: Dict[str, Any]) -> Optional[ClassEntity]:
        """Update a class"""
        pass
    
    @abstractmethod
    async def delete(self, class_id: str) -> bool:
        """Soft delete a class"""
        pass
    
    @abstractmethod
    async def check_uniqueness(
        self,
        name: str,
        section: str,
        academic_year: str,
        organization_id: str,
        exclude_id: Optional[str] = None
    ) -> bool:
        """
        Check if a class name + section + academic year is unique.
        Returns: True if unique, False otherwise
        """
        pass
    
    @abstractmethod
    async def get_by_name_and_section(
        self,
        name: str,
        section: str,
        academic_year: str,
        organization_id: str
    ) -> Optional[ClassEntity]:
        """Get class by name, section, and academic year"""
        pass
    
    @abstractmethod
    async def get_by_academic_year(
        self,
        academic_year: str,
        organization_id: str,
        branch_id: Optional[str] = None
    ) -> List[ClassEntity]:
        """Get all classes for an academic year"""
        pass
    
    @abstractmethod
    async def count_students_in_class(self, class_id: str) -> int:
        """Get current student count in a class"""
        pass
    
    @abstractmethod
    async def check_has_active_students(self, class_id: str) -> bool:
        """Check if class has active student enrollments"""
        pass
