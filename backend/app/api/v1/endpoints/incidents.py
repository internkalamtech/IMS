"""
Incident management endpoints.

Provides REST API endpoints for logging and retrieving driver incidents.
These endpoints implement Issue #281: Incident and Alert Processing Engine.

Acceptance Criteria:
- POST: Endpoint to create incident logs with geographic coordinates.
- List: GET endpoint for drivers to see their specific incident reports.

All endpoints require authentication via JWT token.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.api.schemas import IncidentCreateRequest, IncidentResponse
from app.core.logger import Logger
from app.domain.entities.incident import Incident, IncidentSeverity, IncidentType
from app.domain.entities.user import User
from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.incident_repository_impl import (
    DatabaseIncidentRepository,
)

# Create router
router = APIRouter(prefix="/incidents", tags=["Incident Management"])


# ============================================================================
# INCIDENT ENDPOINTS
# ============================================================================


@router.post(
    "",
    response_model=IncidentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create an incident log",
    description=(
        "Create a new incident report submitted by a driver. "
        "Optionally includes geographic coordinates (latitude/longitude) "
        "to mark the exact location of the incident."
    ),
)
async def create_incident(
    request: IncidentCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> IncidentResponse:
    """
    Create a new incident log.

    The currently authenticated user is recorded as the reporting driver.

    Args:
        request: Incident details (type, severity, description, coordinates)
        db: Database session
        current_user: Authenticated user making the request (the driver)

    Returns:
        Created incident with ID and timestamps

    Raises:
        HTTPException 400: If incident type or severity value is invalid
        HTTPException 500: If a database error occurs
    """
    try:
        Logger.info(
            f"Driver {current_user.id} reporting incident: "
            f"type={request.type}, severity={request.severity}"
        )

        # Validate enum values up-front for a clean 400 response
        incident_type = IncidentType(request.type)
        incident_severity = IncidentSeverity(request.severity)

        # Build domain entity (driver_id comes from the authenticated user)
        incident = Incident(
            id="temp",  # Will be set by repository after DB insert
            driver_id=str(current_user.id),
            type=incident_type,
            severity=incident_severity,
            description=request.description,
            latitude=request.latitude,
            longitude=request.longitude,
        )

        repo = DatabaseIncidentRepository(db)
        created_incident = await repo.create_incident(incident)

        Logger.info(
            f"Incident created successfully with ID: {created_incident.id}"
        )

        return IncidentResponse(
            id=int(created_incident.id),
            driver_id=int(created_incident.driver_id),
            type=created_incident.type.value,
            severity=created_incident.severity.value,
            description=created_incident.description,
            status=created_incident.status,
            latitude=created_incident.latitude,
            longitude=created_incident.longitude,
            created_at=created_incident.created_at,
            updated_at=created_incident.updated_at,
        )

    except ValueError as e:
        Logger.error(f"Invalid incident data: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid incident data: {str(e)}",
        )
    except Exception as e:
        Logger.error(f"Error creating incident: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create incident",
        )


@router.get(
    "/my",
    response_model=List[IncidentResponse],
    status_code=status.HTTP_200_OK,
    summary="Get my incident reports",
    description=(
        "Retrieve all incident reports submitted by the currently "
        "authenticated driver, ordered from newest to oldest."
    ),
)
async def get_my_incidents(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[IncidentResponse]:
    """
    Get all incidents reported by the authenticated driver.

    Args:
        db: Database session
        current_user: Authenticated driver whose incidents to retrieve

    Returns:
        List of incident reports, newest first

    Raises:
        HTTPException 500: If a database error occurs
    """
    try:
        Logger.info(f"Fetching incidents for driver {current_user.id}")

        repo = DatabaseIncidentRepository(db)
        incidents = await repo.get_driver_incidents(str(current_user.id))

        Logger.info(
            f"Retrieved {len(incidents)} incidents for driver {current_user.id}"
        )

        return [
            IncidentResponse(
                id=int(incident.id),
                driver_id=int(incident.driver_id),
                type=incident.type.value,
                severity=incident.severity.value,
                description=incident.description,
                status=incident.status,
                latitude=incident.latitude,
                longitude=incident.longitude,
                created_at=incident.created_at,
                updated_at=incident.updated_at,
            )
            for incident in incidents
        ]

    except Exception as e:
        Logger.error(f"Error fetching driver incidents: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch incidents",
        )
