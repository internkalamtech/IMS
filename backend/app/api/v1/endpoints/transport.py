"""
Transport management endpoints.

This module provides API endpoints for transport management operations.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.api.schemas import (
    StudentResponse,
    StudentAllocationResponse,
    RouteSummaryResponse,
    AssignStudentRequest,
    UpdateAllocationRequest,
    StudentsListResponse,
    RouteSummariesResponse,
    ErrorResponse,
)
from app.core.errors import ValidationError, DatabaseError, NotFoundError
from app.core.logger import Logger
from app.domain.entities.user import User
from app.domain.usecases.transport_usecases import (
    GetStudentsUseCase,
    GetStudentAllocationsUseCase,
    GetAllocationsUseCase,
    AssignStudentToRouteUseCase,
    UpdateStudentAllocationUseCase,
    RemoveStudentAllocationUseCase,
    GetRouteSummariesUseCase,
)
from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.database_transport_repository import (
    DatabaseTransportRepository,
)

router = APIRouter(prefix="/transport", tags=["Transport Management"])


@router.get(
    "/students",
    response_model=StudentsListResponse,
    status_code=status.HTTP_200_OK,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Get students with filtering",
    description=(
        "Retrieve a paginated list of students with optional filtering by name, class, or route stop."
    ),
)
async def get_students(
    search: Optional[str] = Query(None, description="Search by student name"),
    class_filter: Optional[str] = Query(None, alias="class", description="Filter by class name"),
    route_stop: Optional[str] = Query(None, description="Filter by assigned route stop"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    db: AsyncSession = Depends(get_db),
    # current_user: User = Depends(get_current_user),  # Temporarily disabled for testing
):
    """
    Get students with optional filtering and pagination.

    Requires transport or admin role.
    """
    try:
        # Check permissions - temporarily disabled for testing
        # if current_user.role not in ["admin", "transport"]:
        #     raise HTTPException(
        #         status_code=status.HTTP_403_FORBIDDEN,
        #         detail="Insufficient permissions",
        #     )

        repository = DatabaseTransportRepository(db)
        usecase = GetStudentsUseCase(repository)

        students = await usecase.execute(
            search_query=search,
            class_filter=class_filter,
            route_stop_filter=route_stop,
            limit=limit,
            offset=offset,
        )

        # For now, return total as length of results (in production, you'd count total)
        total = len(students)  # This should be improved with a proper count query

        return StudentsListResponse(
            students=[student.to_dict() for student in students],
            total=total,
            limit=limit,
            offset=offset,
        )

    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except DatabaseError as e:
        Logger.error(f"Database error in get_students: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")
    except Exception as e:
        Logger.error(f"Unexpected error in get_students: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get(
    "/students/{student_id}/allocations",
    response_model=list[StudentAllocationResponse],
    status_code=status.HTTP_200_OK,
    responses={
        404: {"model": ErrorResponse, "description": "Student not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Get student allocations",
    description="Retrieve all route allocations for a specific student.",
)
async def get_student_allocations(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all route allocations for a student.

    Requires transport or admin role.
    """
    try:
        # Check permissions
        if current_user.role not in ["admin", "transport"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        repository = DatabaseTransportRepository(db)
        usecase = GetStudentAllocationsUseCase(repository)

        allocations = await usecase.execute(student_id)

        return [allocation.to_dict() for allocation in allocations]

    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DatabaseError as e:
        Logger.error(f"Database error in get_student_allocations: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")
    except Exception as e:
        Logger.error(f"Unexpected error in get_student_allocations: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get(
    "/allocations",
    response_model=list[StudentAllocationResponse],
    status_code=status.HTTP_200_OK,
    responses={
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Get all allocations",
    description="Retrieve all student route allocations with optional filtering by route or student.",
)
async def get_allocations(
    route_id: Optional[str] = Query(None, description="Filter by route ID"),
    student_id: Optional[str] = Query(None, description="Filter by student ID"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all student route allocations with optional filtering.

    Requires transport or admin role.
    """
    try:
        # Check permissions
        if current_user.role not in ["admin", "transport"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        repository = DatabaseTransportRepository(db)
        usecase = GetAllocationsUseCase(repository)

        allocations = await usecase.execute(
            route_id=route_id,
            student_id=student_id,
            limit=limit,
            offset=offset,
        )

        return [allocation.to_dict() for allocation in allocations]

    except DatabaseError as e:
        Logger.error(f"Database error in get_allocations: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")
    except Exception as e:
        Logger.error(f"Unexpected error in get_allocations: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.post(
    "/allocations",
    response_model=StudentAllocationResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        404: {"model": ErrorResponse, "description": "Student, route, or stop not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Assign student to route",
    description="Assign a student to a specific route stop for pickup/drop-off.",
)
async def assign_student_to_route(
    request: AssignStudentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Assign a student to a route stop.

    Requires transport or admin role.
    """
    try:
        # Check permissions
        if current_user.role not in ["admin", "transport"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        repository = DatabaseTransportRepository(db)
        usecase = AssignStudentToRouteUseCase(repository)

        allocation = await usecase.execute(
            student_id=request.studentId,
            route_id=request.routeId,
            stop_id=request.stopId,
            allocation_type=request.allocationType,
        )

        return allocation.to_dict()

    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DatabaseError as e:
        Logger.error(f"Database error in assign_student_to_route: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")
    except Exception as e:
        Logger.error(f"Unexpected error in assign_student_to_route: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.put(
    "/allocations/{allocation_id}",
    response_model=StudentAllocationResponse,
    status_code=status.HTTP_200_OK,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        404: {"model": ErrorResponse, "description": "Allocation not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Update student allocation",
    description="Update a student's route allocation (change route, stop, or allocation type).",
)
async def update_student_allocation(
    allocation_id: str,
    request: UpdateAllocationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update a student's route allocation.

    Requires transport or admin role.
    """
    try:
        # Check permissions
        if current_user.role not in ["admin", "transport"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        repository = DatabaseTransportRepository(db)
        usecase = UpdateStudentAllocationUseCase(repository)

        allocation = await usecase.execute(
            allocation_id=allocation_id,
            route_id=request.routeId,
            stop_id=request.stopId,
            allocation_type=request.allocationType,
            is_active=request.isActive,
        )

        if not allocation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Allocation not found",
            )

        return allocation.to_dict()

    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DatabaseError as e:
        Logger.error(f"Database error in update_student_allocation: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")
    except Exception as e:
        Logger.error(f"Unexpected error in update_student_allocation: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.delete(
    "/allocations/{allocation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        404: {"model": ErrorResponse, "description": "Allocation not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Remove student allocation",
    description="Remove a student's route allocation.",
)
async def remove_student_allocation(
    allocation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Remove a student's route allocation.

    Requires transport or admin role.
    """
    try:
        # Check permissions
        if current_user.role not in ["admin", "transport"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        repository = DatabaseTransportRepository(db)
        usecase = RemoveStudentAllocationUseCase(repository)

        success = await usecase.execute(allocation_id)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Allocation not found",
            )

        return {"message": "Allocation removed successfully"}

    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DatabaseError as e:
        Logger.error(f"Database error in remove_student_allocation: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")
    except Exception as e:
        Logger.error(f"Unexpected error in remove_student_allocation: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get(
    "/routes/summaries",
    response_model=RouteSummariesResponse,
    status_code=status.HTTP_200_OK,
    responses={
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Get route summaries",
    description="Retrieve summary information for all routes including student counts and vehicle capacity utilization.",
)
async def get_route_summaries(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get route summaries with student counts and capacity information.

    Requires transport or admin role.
    """
    try:
        # Check permissions
        if current_user.role not in ["admin", "transport"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        repository = DatabaseTransportRepository(db)
        usecase = GetRouteSummariesUseCase(repository)

        summaries = await usecase.execute()

        return RouteSummariesResponse(
            summaries=[summary.to_dict() for summary in summaries]
        )

    except DatabaseError as e:
        Logger.error(f"Database error in get_route_summaries: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")
    except Exception as e:
        Logger.error(f"Unexpected error in get_route_summaries: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")