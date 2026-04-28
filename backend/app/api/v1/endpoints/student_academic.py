"""
Student Academic Data API Endpoints.

Provides RESTful API endpoints for authenticated students to retrieve
their academic data including timetables, homework, and learning materials.

Acceptance Criteria Implementation:
1. GET /students/academic/timetable - Fetch timetable based on student's class
2. GET /students/academic/homework-materials - Retrieve homework and materials
3. Security: Data strictly scoped to authenticated student's identity

Following best practices:
- JWT authentication required (get_current_user dependency)
- Role-based access control (student role only)
- Data scoping (student can only access their own data)
- Comprehensive error handling
- Proper logging for audit trail
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.api.schemas import (
    StudentTimetableResponse,
    StudentHomeworkMaterialsResponse,
    ErrorResponse,
)
from app.core.errors import ValidationError, NotFoundError, DatabaseError
from app.core.logger import Logger
from app.domain.entities.user import User
from app.domain.usecases.student_academic_usecases import (
    GetStudentTimetableUseCase,
    GetStudentHomeworkAndMaterialsUseCase,
)
from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.student_academic_repository import (
    StudentAcademicRepository,
)

router = APIRouter(prefix="/students/academic", tags=["Student Academic Data"])


@router.get(
    "/timetable",
    response_model=StudentTimetableResponse,
    status_code=status.HTTP_200_OK,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized - No authentication"},
        403: {"model": ErrorResponse, "description": "Forbidden - Only students can access"},
        404: {"model": ErrorResponse, "description": "Student not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Get Student Timetable",
    description=(
        "Retrieve timetable records for the authenticated student based on their class. "
        "Data is strictly scoped to the student's enrolled class only. "
        "Requires valid JWT token and student role."
    ),
)
async def get_student_timetable(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StudentTimetableResponse:
    """
    Get timetable endpoint for authenticated student.

    Security checks:
    - Requires valid JWT authentication
    - Verifies user has student role
    - Ensures data access is limited to own class

    Acceptance Criteria #1:
    ✅ GET: Fetch timetable records based on the student's classId

    Args:
        current_user: Authenticated user from JWT token
        db: Database session (injected)

    Returns:
        StudentTimetableResponse with timetable entries and class information

    Raises:
        HTTPException 401: If not authenticated
        HTTPException 403: If user is not a student
        HTTPException 404: If student record not found
        HTTPException 500: If internal server error
    """
    try:
        Logger.info(f"Timetable request from user: {current_user.email}")

        # Security Check 1: Verify user has student role
        user_roles = [role.name for role in current_user.roles]
        if "student" not in user_roles:
            Logger.warning(
                f"Unauthorized timetable access attempt by non-student: "
                f"{current_user.email} (roles: {user_roles})"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only students can access their timetable",
            )

        # Initialize repository and use case
        repository = StudentAcademicRepository(db)
        use_case = GetStudentTimetableUseCase(repository)

        # Fetch student record and verify they exist
        student = await repository.get_student_by_user_id(str(current_user.id))
        if not student:
            Logger.warning(
                f"Student record not found for user: {current_user.email} "
                f"(user_id: {current_user.id})"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student record not found",
            )

        # Execute use case to get timetable
        result = await use_case.execute(student.id)

        Logger.info(
            f"Timetable successfully retrieved for student {student.id} "
            f"(email: {current_user.email})"
        )

        # Return response with proper security scoping
        return StudentTimetableResponse(
            timetable=result["timetable"],
            class_id=result["class_id"],
            class_name=result["class_name"],
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except ValidationError as e:
        Logger.warning(f"Validation error in timetable endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except NotFoundError as e:
        Logger.warning(f"Not found error in timetable endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except DatabaseError as e:
        Logger.error(f"Database error in timetable endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve timetable. Please try again later.",
        )
    except Exception as e:
        Logger.error(
            f"Unexpected error in timetable endpoint: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again later.",
        )


@router.get(
    "/homework-materials",
    response_model=StudentHomeworkMaterialsResponse,
    status_code=status.HTTP_200_OK,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized - No authentication"},
        403: {"model": ErrorResponse, "description": "Forbidden - Only students can access"},
        404: {"model": ErrorResponse, "description": "Student not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Get Student Homework and Materials",
    description=(
        "Retrieve homework assignments and learning materials for the authenticated student "
        "based on their class and enrolled subjects. "
        "Data is filtered by student's enrollment and subject mapping. "
        "Requires valid JWT token and student role."
    ),
)
async def get_student_homework_materials(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StudentHomeworkMaterialsResponse:
    """
    Get homework and materials endpoint for authenticated student.

    Security checks:
    - Requires valid JWT authentication
    - Verifies user has student role
    - Ensures data access is limited to own class and subjects
    - Homework filtered by student's class
    - Materials filtered by student's enrolled subjects

    Acceptance Criteria #2:
    ✅ GET: Retrieve homework and materials filtered by the student's enrollment 
            and subject mapping

    Args:
        current_user: Authenticated user from JWT token
        db: Database session (injected)

    Returns:
        StudentHomeworkMaterialsResponse with homework and materials lists

    Raises:
        HTTPException 401: If not authenticated
        HTTPException 403: If user is not a student
        HTTPException 404: If student record not found
        HTTPException 500: If internal server error
    """
    try:
        Logger.info(f"Homework and materials request from user: {current_user.email}")

        # Security Check 1: Verify user has student role
        user_roles = [role.name for role in current_user.roles]
        if "student" not in user_roles:
            Logger.warning(
                f"Unauthorized homework/materials access by non-student: "
                f"{current_user.email} (roles: {user_roles})"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only students can access homework and materials",
            )

        # Initialize repository and use case
        repository = StudentAcademicRepository(db)
        use_case = GetStudentHomeworkAndMaterialsUseCase(repository)

        # Fetch student record and verify they exist
        student = await repository.get_student_by_user_id(str(current_user.id))
        if not student:
            Logger.warning(
                f"Student record not found for user: {current_user.email} "
                f"(user_id: {current_user.id})"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student record not found",
            )

        # Execute use case to get homework and materials
        result = await use_case.execute(student.id)

        Logger.info(
            f"Homework and materials successfully retrieved for student {student.id} "
            f"(email: {current_user.email}, "
            f"homework: {len(result['homework'])}, "
            f"materials: {len(result['materials'])})"
        )

        # Return response with proper security scoping
        return StudentHomeworkMaterialsResponse(
            homework=result["homework"],
            materials=result["materials"],
            class_id=result["class_id"],
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except ValidationError as e:
        Logger.warning(f"Validation error in homework/materials endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except NotFoundError as e:
        Logger.warning(f"Not found error in homework/materials endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except DatabaseError as e:
        Logger.error(f"Database error in homework/materials endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve homework and materials. Please try again later.",
        )
    except Exception as e:
        Logger.error(
            f"Unexpected error in homework/materials endpoint: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again later.",
        )
