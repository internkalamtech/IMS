"""
Student and Parent enrollment endpoints.

Provides API endpoints for creating students with parent links.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas import (
    CreateStudentWithParentRequest,
    CreateStudentWithParentResponse,
    StudentResponse,
    ParentResponse,
    ErrorResponse,
)
from app.core.errors import ValidationError, DatabaseError
from app.core.logger import Logger
from app.domain.usecases.enrollment_usecases import CreateStudentWithParentUseCase
from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.database_enrollment_repository import (
    DatabaseEnrollmentRepository,
    DatabaseParentRepository,
)

router = APIRouter(prefix="/enrollment", tags=["Enrollment"])


@router.post(
    "/students/with-parent",
    response_model=CreateStudentWithParentResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        409: {"model": ErrorResponse, "description": "Conflict - duplicate student/parent"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Create Student with Parent Link",
    description=(
        "Create a new Student user and link to a Parent profile in a single transaction. "
        "Validates both student and parent information, ensures unique constraints, "
        "and establishes the relationship between entities."
    ),
)
async def create_student_with_parent(
    request: CreateStudentWithParentRequest,
    db: AsyncSession = Depends(get_db),
) -> CreateStudentWithParentResponse:
    """
    Create a student with parent link endpoint.

    Creates a new student and links to a parent (new or existing) in a single transaction.
    Validates:
    - Student basic info (Name, Roll Number)
    - Student class enrollment (Class ID must exist)
    - Parent info (Name, Phone, Email)
    - Uniqueness constraints (Roll Number, Email)

    Args:
        request: Request containing student and parent data
        db: Database session (injected)

    Returns:
        CreateStudentWithParentResponse with created student and parent data

    Raises:
        HTTPException 400: If validation fails
        HTTPException 409: If duplicate student roll number or parent email
        HTTPException 500: If internal server error occurs
    """
    try:
        Logger.info(
            f"Create student request: {request.student.name}, "
            f"Parent: {request.parent.name}"
        )

        # Initialize repositories
        enrollment_repo = DatabaseEnrollmentRepository(db)
        parent_repo = DatabaseParentRepository(db)

        # Create and execute use case
        use_case = CreateStudentWithParentUseCase(enrollment_repo, parent_repo)
        student, parent = await use_case.execute(
            student_name=request.student.name,
            student_roll_number=request.student.roll_number,
            class_id=request.student.class_id,
            class_name=request.student.class_name,
            parent_name=request.parent.name,
            parent_phone=request.parent.phone,
            parent_email=request.parent.email,
            parent_relationship_type=request.parent.relationship_type,
            link_existing_parent=request.link_existing_parent,
        )

        # Commit the transaction
        await db.commit()

        Logger.info(
            f"Successfully created student {student.id} "
            f"with parent {parent.id}"
        )

        # Build and return response
        return CreateStudentWithParentResponse(
            student=StudentResponse(
                id=student.id,
                name=student.name,
                roll_number=student.roll_number,
                class_id=request.student.class_id,
                class_name=student.class_name,
                next_due_date=student.next_due_date,
                created_at=student.created_at,
                updated_at=student.updated_at,
            ),
            parent=ParentResponse(
                id=parent.id,
                name=parent.name,
                phone=parent.phone,
                email=parent.email,
                relationship_type=parent.relationship_type,
                is_active=parent.is_active,
                created_at=parent.created_at,
                updated_at=parent.updated_at,
            ),
            message="Student and parent created successfully with link established",
        )

    except ValidationError as e:
        Logger.warning(f"Validation error in create student: {str(e)}")

        # Determine if it's a conflict (409) or bad request (400)
        error_msg = str(e).lower()
        status_code = (
            status.HTTP_409_CONFLICT
            if any(
                keyword in error_msg
                for keyword in [
                    "already exists",
                    "duplicate",
                    "conflict",
                    "link already exists",
                ]
            )
            else status.HTTP_400_BAD_REQUEST
        )

        await db.rollback()
        raise HTTPException(
            status_code=status_code,
            detail=str(e),
        )

    except DatabaseError as e:
        Logger.error(f"Database error in create student: {str(e)}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process request. Please try again later.",
        )

    except Exception as e:
        Logger.error(f"Unexpected error in create student: {str(e)}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again later.",
        )
