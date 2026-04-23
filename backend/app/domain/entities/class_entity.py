"""
backend/app/domain/entities/class_entity.py
STORY_CLASS_CREATE_API - Class Entity Model (Academic Class Management)
"""

from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class ClassStatus(str, Enum):
    """Status of a class"""
    ACTIVE = "active"
    ARCHIVED = "archived"
    INACTIVE = "inactive"


@dataclass
class ClassEntity:
    """
    Represents an academic class in the institute.
    
    A class is:
    - A container for students
    - Associated with a section (A, B, C, etc.)
    - Mapped to an academic year
    - Has assigned teachers
    - Has associated fee structure
    """
    id: Optional[str] = None
    name: str = ""  # e.g., "Class 10", "Grade 9", etc.
    section: str = ""  # e.g., "A", "B", "C"
    section_name: Optional[str] = None  # e.g., "Science", "Commerce"
    academic_year: str = ""  # e.g., "2024-2025"
    academic_period_id: Optional[str] = None
    class_teacher_id: Optional[str] = None
    class_teacher_name: Optional[str] = None
    max_students: Optional[int] = None  # Optional capacity limit
    current_student_count: int = 0
    total_subjects: int = 0
    status: ClassStatus = ClassStatus.ACTIVE
    organization_id: Optional[str] = None
    branch_id: Optional[str] = None
    created_by_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_deleted: bool = False
    subjects: List[str] = field(default_factory=list)  # Subject IDs/codes
    
    def get_full_name(self) -> str:
        """Get the full class name with section"""
        if self.section:
            return f"{self.name}-{self.section}"
        return self.name
    
    def is_at_capacity(self) -> bool:
        """Check if class has reached max student limit"""
        if not self.max_students:
            return False
        return self.current_student_count >= self.max_students
    
    def validate(self) -> tuple[bool, Optional[str]]:
        """Validate class data"""
        if not self.name or not self.name.strip():
            return False, "Class name is required"
        
        if not self.section or not self.section.strip():
            return False, "Section is required (e.g., A, B, C)"
        
        if not self.academic_year or not self.academic_year.strip():
            return False, "Academic year is required"
        
        if self.max_students and self.max_students < 1:
            return False, "Max students must be at least 1"
        
        if self.current_student_count < 0:
            return False, "Current student count cannot be negative"
        
        if self.max_students and self.current_student_count > self.max_students:
            return False, "Current student count exceeds maximum capacity"
        
        return True, None
