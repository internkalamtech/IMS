"""
Use cases for Incident operations.

These contain the business logic for creating and retrieving incidents.
Follows the same pattern as auth_usecases.py.
"""

from app.domain.entities.incident import (
    Incident,
    IncidentSeverity,
    IncidentType,
)
from app.domain.repositories.incident_repository import IncidentRepository


class CreateIncidentUseCase:
    """Use case for creating a new incident report."""

    def __init__(self, incident_repository: IncidentRepository) -> None:
        self.incident_repository = incident_repository

    async def execute(
        self,
        driver_id: str,
        incident_type: IncidentType,
        severity: IncidentSeverity,
        description: str,
    ) -> Incident:
        """
        Create a new incident.

        Args:
            driver_id: ID of the driver reporting
            incident_type: Type of incident
            severity: Severity level
            description: Description of the incident

        Returns:
            The created Incident entity

        Raises:
            ValueError: If description is empty
        """
        if not description or not description.strip():
            raise ValueError("Incident description is required")

        return await self.incident_repository.create_incident(
            driver_id=driver_id,
            incident_type=incident_type,
            severity=severity,
            description=description.strip(),
        )


class GetDriverIncidentsUseCase:
    """Use case for retrieving all incidents for a driver."""

    def __init__(self, incident_repository: IncidentRepository) -> None:
        self.incident_repository = incident_repository

    async def execute(self, driver_id: str) -> list[Incident]:
        """
        Get all incidents reported by a driver.

        Args:
            driver_id: ID of the driver

        Returns:
            List of Incident entities
        """
        return await self.incident_repository.get_incidents_by_driver(
            driver_id
        )
