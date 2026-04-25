"""Endpoints for student transport enrollments and route manifests."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.authz import require_roles
from app.api.schemas import (
    ErrorResponse,
    CreateStudentTransportEnrollmentsRequest,
    CreateStudentTransportEnrollmentsResponse,
    RouteManifestResponse,
)
from app.domain.entities.user import User
from app.domain.usecases.student_transport_enrollment import (
    StudentTransportEnrollmentUseCase,
)
from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.student_transport_repository import (
    StudentTransportRepository,
)

router = APIRouter(prefix="/transport", tags=["Transport"])


@router.post(
    "/enrollments",
    response_model=CreateStudentTransportEnrollmentsResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        404: {
            "model": ErrorResponse,
            "description": "Student not found",
        },
        401: {"description": "Authentication required"},
        403: {"description": "Insufficient permissions"},
    },
    summary="Create student transport enrollments",
    description=(
        "Create one or more records linking studentId to stopId and routeId "
        "with optional pickup/drop-off schedule times."
    ),
)
async def create_student_transport_enrollments(
    request: CreateStudentTransportEnrollmentsRequest,
    _current_user: User = Depends(require_roles("admin", "transport")),
    db: AsyncSession = Depends(get_db),
) -> CreateStudentTransportEnrollmentsResponse:
    repository = StudentTransportRepository(db)
    use_case = StudentTransportEnrollmentUseCase(repository)

    payload = [item.model_dump() for item in request.enrollments]
    created = await use_case.create_enrollments(payload)

    return CreateStudentTransportEnrollmentsResponse(
        message="Student transport enrollments created successfully",
        count=len(created),
        enrollments=created,
    )


@router.get(
    "/routes/{route_id}/students",
    response_model=RouteManifestResponse,
    status_code=status.HTTP_200_OK,
    summary="Get students by route",
    description=(
        "Retrieve route-wise student list for driver manifest generation."
    ),
)
async def get_students_by_route(
    route_id: str,
    _current_user: User = Depends(
        require_roles("admin", "transport", "driver")
    ),
    db: AsyncSession = Depends(get_db),
) -> RouteManifestResponse:
    repository = StudentTransportRepository(db)
    use_case = StudentTransportEnrollmentUseCase(repository)

    data = await use_case.get_students_for_route(route_id)
    return RouteManifestResponse(**data)
