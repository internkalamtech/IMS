"""
backend/app/api/schemas/class_schema.py
STORY_CLASS_CREATE_API - Class Management API Schemas
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime


class ClassCreateSchema(BaseModel):
    """Request schema for creating a class"""
    name: str = Field(..., min_length=1, max_length=100, description="Class name (e.g., Class 10, Grade 9)")
    section: str = Field(..., min_length=1, max_length=20, description="Section (e.g., A, B, C)")
    section_name: Optional[str] = Field(None, max_length=100, description="Section specialization (e.g., Science, Commerce)")
    academic_year: str = Field(..., min_length=4, max_length=20, description="Academic year (e.g., 2024-2025)")
    class_teacher_id: Optional[str] = Field(None, description="Class teacher ID")
    max_students: Optional[int] = Field(None, ge=1, description="Maximum student capacity")
    subjects: Optional[List[str]] = Field(None, description="List of subject IDs/codes")


class ClassUpdateSchema(BaseModel):
    """Request schema for updating a class"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    section: Optional[str] = Field(None, min_length=1, max_length=20)
    section_name: Optional[str] = Field(None, max_length=100)
    class_teacher_id: Optional[str] = None
    max_students: Optional[int] = Field(None, ge=1)
    subjects: Optional[List[str]] = None


class ClassResponseSchema(BaseModel):
    """Response schema for a class"""
    id: str
    name: str
    section: str
    section_name: Optional[str]
    academic_year: str
    class_teacher_id: Optional[str]
    class_teacher_name: Optional[str]
    max_students: Optional[int]
    current_student_count: int
    total_subjects: int
    status: str
    full_name: str  # e.g., "Class 10-A"
    created_at: datetime
    updated_at: Optional[datetime]


class ClassListResponseSchema(BaseModel):
    """Response schema for listing classes"""
    total: int
    page: int
    page_size: int
    items: List[ClassResponseSchema]


class ClassValidationSchema(BaseModel):
    """Request for validation"""
    name: str
    section: str
    academic_year: str
    exclude_id: Optional[str] = None


class ValidationResponseSchema(BaseModel):
    """Response for validation"""
    is_valid: bool
    message: Optional[str] = None
