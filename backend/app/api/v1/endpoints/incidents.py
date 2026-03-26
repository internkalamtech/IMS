"""
Incident API endpoints.

Provides endpoints for creating and listing driver incidents.
Follows the same pattern as dashboard.py.
"""

from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_current_user
from app.api.schemas import (
    CreateIncidentRequest,
    IncidentListResponse,
    IncidentResponse,
)
from app.domain.entities.user import User
from app.domain.usecases.incident_usecases import (
    CreateIncidentUseCase,
    GetDriverIncidentsUseCase,
)
from app.infrastructure.repositories.database_incident_repository import (
    DatabaseIncidentRepository,
)

router = APIRouter(prefix="/incidents", tags=["Incidents"])

# Dependency injection
incident_repository = DatabaseIncidentRepository()
create_incident_usecase = CreateIncidentUseCase(incident_repository)
get_driver_incidents_usecase = GetDriverIncidentsUseCase(incident_repository)


@router.post(
    "",
    response_model=IncidentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Report a new incident",
    description=(
        "Create a new incident report. "
        "Only accessible to authenticated drivers."
    ),
)
async def create_incident(
    request: CreateIncidentRequest,
    current_user: User = Depends(get_current_user),
) -> IncidentResponse:
    """
    Create a new incident endpoint.

    Allows drivers to report breakdowns, accidents, or delays.
    """
    incident = await create_incident_usecase.execute(
        driver_id=current_user.id,
        incident_type=request.type,
        severity=request.severity,
        description=request.description,
    )

    return IncidentResponse(**incident.to_dict())


@router.get(
    "",
    response_model=IncidentListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get driver's incidents",
    description=(
        "Retrieve all incidents reported by the authenticated driver."
    ),
)
async def get_incidents(
    current_user: User = Depends(get_current_user),
) -> IncidentListResponse:
    """
    Get incidents endpoint.

    Returns all incidents reported by the current driver,
    ordered by most recent first.
    """
    incidents = await get_driver_incidents_usecase.execute(
        driver_id=current_user.id
    )

    return IncidentListResponse(
        incidents=[
            IncidentResponse(**i.to_dict()) for i in incidents
        ]
    )
