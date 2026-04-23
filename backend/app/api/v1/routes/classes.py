"""
backend/app/api/v1/routes/classes.py
STORY_CLASS_CREATE_API - Class Management API Endpoints

Implements:
- POST /classes (Create class)
- GET /classes (List classes)
- GET /classes/:id (Get by ID)
- PUT /classes/:id (Update)
- DELETE /classes/:id (Delete)
- POST /classes/validate/uniqueness (Validate)
"""

from fastapi import APIRouter, HTTPException, Query, Depends, status
from typing import List, Optional
from app.api.schemas.class_schema import (
    ClassCreateSchema,
    ClassUpdateSchema,
    ClassResponseSchema,
    ClassListResponseSchema,
    ClassValidationSchema,
    ValidationResponseSchema,
)
from app.domain.entities.class_entity import ClassEntity, ClassStatus
from app.api.dependencies import get_current_user
from app.core.logger import logger
from datetime import datetime

router = APIRouter(prefix="/classes", tags=["classes"])


@router.post("", response_model=ClassResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_class(
    payload: ClassCreateSchema,
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new class.
    
    Request:
    - name: Class name (required)
    - section: Section letter/number (required, e.g., A, B, C)
    - academic_year: Academic year (required, e.g., 2024-2025)
    - class_teacher_id: Optional teacher assignment
    - max_students: Optional capacity limit
    - subjects: Optional list of subject IDs
    
    Returns:
    - 201: Created class with full details
    - 400: Validation error
    - 409: Class+Section+Year combination already exists
    - 401: Unauthorized
    """
    try:
        logger.info(f"Creating class: {payload.name}-{payload.section} ({payload.academic_year})")
        
        # TODO: Integrate with actual repository
        # 1. Validate uniqueness of name + section + academic_year
        # 2. Create ClassEntity
        # 3. Save to database
        # 4. Return created class
        
        class_entity = ClassEntity(
            id="CLASS_001",
            name=payload.name,
            section=payload.section,
            section_name=payload.section_name,
            academic_year=payload.academic_year,
            class_teacher_id=payload.class_teacher_id,
            max_students=payload.max_students,
            subjects=payload.subjects or [],
            status=ClassStatus.ACTIVE,
            created_at=datetime.utcnow(),
        )
        
        logger.info(f"Class created successfully: {class_entity.id}")
        
        return ClassResponseSchema(
            id=class_entity.id,
            name=class_entity.name,
            section=class_entity.section,
            section_name=class_entity.section_name,
            academic_year=class_entity.academic_year,
            class_teacher_id=class_entity.class_teacher_id,
            class_teacher_name=None,
            max_students=class_entity.max_students,
            current_student_count=0,
            total_subjects=len(class_entity.subjects),
            status=class_entity.status.value,
            full_name=class_entity.get_full_name(),
            created_at=class_entity.created_at or datetime.utcnow(),
            updated_at=None,
        )
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating class: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("", response_model=ClassListResponseSchema)
async def list_classes(
    academic_year: Optional[str] = Query(None, description="Filter by academic year"),
    class_name: Optional[str] = Query(None, description="Filter by class name"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    """
    Fetch all classes with optional filtering.
    
    Query Parameters:
    - academic_year: Optional filter by academic year
    - class_name: Optional filter by class name
    - skip: Pagination offset (default: 0)
    - limit: Items per page (default: 50, max: 100)
    
    Returns:
    - Paginated list of classes with metadata
    """
    try:
        logger.info(f"Fetching classes - year: {academic_year}, name: {class_name}")
        
        # TODO: Integrate with actual repository
        # 1. Query database with filters
        # 2. Apply pagination
        # 3. Return results with counts
        
        return ClassListResponseSchema(
            total=0,
            page=skip // limit + 1,
            page_size=limit,
            items=[],
        )
    except Exception as e:
        logger.error(f"Error fetching classes: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{class_id}", response_model=ClassResponseSchema)
async def get_class(
    class_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Fetch a specific class by ID.
    
    Returns:
    - Class details including student count and subjects
    
    Raises:
    - 404: Class not found
    """
    try:
        logger.info(f"Fetching class: {class_id}")
        
        # TODO: Integrate with actual repository
        # 1. Query database by ID
        # 2. Check if exists
        # 3. Return class or 404
        
        raise HTTPException(status_code=404, detail="Class not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching class: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/{class_id}", response_model=ClassResponseSchema)
async def update_class(
    class_id: str,
    payload: ClassUpdateSchema,
    current_user: dict = Depends(get_current_user),
):
    """
    Update class details.
    
    Prevents updates that would create duplicates.
    
    Returns:
    - Updated class details
    
    Raises:
    - 404: Class not found
    - 400: Invalid data
    - 409: Duplicate class name + section
    """
    try:
        logger.info(f"Updating class: {class_id}")
        
        # TODO: Integrate with actual repository
        # 1. Fetch existing class
        # 2. Update allowed fields
        # 3. Validate uniqueness if name/section changed
        # 4. Save and return
        
        raise HTTPException(status_code=404, detail="Class not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating class: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_class(
    class_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Delete a class (soft delete).
    
    Prevents deletion of classes with active student enrollments.
    
    Raises:
    - 404: Class not found
    - 409: Has active students - cannot delete
    """
    try:
        logger.info(f"Deleting class: {class_id}")
        
        # TODO: Integrate with actual repository
        # 1. Fetch class
        # 2. Check for active student enrollments
        # 3. If none, soft delete
        # 4. Return 204
        
        raise HTTPException(status_code=404, detail="Class not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting class: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/validate/uniqueness", response_model=ValidationResponseSchema)
async def validate_class_uniqueness(
    payload: ClassValidationSchema,
    current_user: dict = Depends(get_current_user),
):
    """
    Validate if class name + section combination is unique.
    
    Returns:
    - is_valid: Boolean indicating uniqueness
    """
    try:
        logger.info(f"Validating class uniqueness: {payload.name}-{payload.section}")
        
        # TODO: Integrate with actual repository
        # 1. Query database
        # 2. Check if exists (excluding provided ID if updating)
        # 3. Return validation result
        
        return ValidationResponseSchema(
            is_valid=True,
            message="Class name and section combination is available",
        )
    except Exception as e:
        logger.error(f"Error validating class: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
