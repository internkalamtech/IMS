"""
backend/app/infrastructure/repositories/class_repository_impl.py
STORY_CLASS_LIST_API - Class Repository Implementation (Mock)
"""

from typing import List, Optional, Dict, Any
from app.domain.repositories.class_repository import ClassRepository
from app.domain.entities.class_entity import ClassEntity, ClassStatus
from datetime import datetime


class ClassRepositoryImpl(ClassRepository):
    """Mock implementation for development/testing"""
    
    def __init__(self):
        # Mock database
        self.db = {}
        self.counter = 0
    
    async def create(self, class_entity: ClassEntity) -> ClassEntity:
        """Create a new class"""
        self.counter += 1
        class_entity.id = f"CLASS_{self.counter:03d}"
        self.db[class_entity.id] = class_entity
        return class_entity
    
    async def get_by_id(self, class_id: str) -> Optional[ClassEntity]:
        """Fetch a class by ID"""
        return self.db.get(class_id)
    
    async def list(
        self,
        organization_id: str,
        branch_id: Optional[str] = None,
        academic_year: Optional[str] = None,
        class_name: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[List[ClassEntity], int]:
        """List classes with filtering and pagination"""
        results = list(self.db.values())
        
        # Apply filters
        if academic_year:
            results = [c for c in results if c.academic_year == academic_year]
        if class_name:
            results = [c for c in results if class_name.lower() in c.name.lower()]
        if not c.is_deleted for c in results]
        
        total = len(results)
        
        # Apply pagination
        paginated = results[skip:skip + limit]
        
        return paginated, total
    
    async def update(self, class_id: str, data: Dict[str, Any]) -> Optional[ClassEntity]:
        """Update a class"""
        if class_id not in self.db:
            return None
        
        entity = self.db[class_id]
        for key, value in data.items():
            if hasattr(entity, key):
                setattr(entity, key, value)
        
        entity.updated_at = datetime.utcnow()
        return entity
    
    async def delete(self, class_id: str) -> bool:
        """Soft delete a class"""
        if class_id not in self.db:
            return False
        
        entity = self.db[class_id]
        entity.is_deleted = True
        entity.updated_at = datetime.utcnow()
        return True
    
    async def check_uniqueness(
        self,
        name: str,
        section: str,
        academic_year: str,
        organization_id: str,
        exclude_id: Optional[str] = None
    ) -> bool:
        """Check if class is unique"""
        for entity in self.db.values():
            if entity.is_deleted:
                continue
            if (entity.name == name and 
                entity.section == section and 
                entity.academic_year == academic_year):
                if exclude_id and entity.id == exclude_id:
                    continue
                return False
        return True
    
    async def get_by_name_and_section(
        self,
        name: str,
        section: str,
        academic_year: str,
        organization_id: str
    ) -> Optional[ClassEntity]:
        """Get class by name, section, year"""
        for entity in self.db.values():
            if (entity.name == name and 
                entity.section == section and 
                entity.academic_year == academic_year and
                not entity.is_deleted):
                return entity
        return None
    
    async def get_by_academic_year(
        self,
        academic_year: str,
        organization_id: str,
        branch_id: Optional[str] = None
    ) -> List[ClassEntity]:
        """Get all classes for academic year"""
        return [c for c in self.db.values() 
                if c.academic_year == academic_year and not c.is_deleted]
    
    async def count_students_in_class(self, class_id: str) -> int:
        """Get student count"""
        if class_id in self.db:
            return self.db[class_id].current_student_count
        return 0
    
    async def check_has_active_students(self, class_id: str) -> bool:
        """Check if has active students"""
        if class_id in self.db:
            return self.db[class_id].current_student_count > 0
        return False
