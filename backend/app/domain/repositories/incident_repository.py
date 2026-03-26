"""
Repository interface for Incidents.

Defines the contract that any incident data source must implement.
This follows the same pattern as auth_repository.py.
"""

from abc import ABC, abstractmethod

from app.domain.entities.incident import (
    Incident,
    IncidentSeverity,
    IncidentType,
)


class IncidentRepository(ABC):
    """Abstract repository interface for incident operations."""

    @abstractmethod
    async def create_incident(
        self,
        driver_id: str,
        incident_type: IncidentType,
        severity: IncidentSeverity,
        description: str,
    ) -> Incident:
        """
        Create a new incident report.

        Args:
            driver_id: ID of the driver reporting the incident
            incident_type: Type of incident
            severity: Severity level
            description: Description of the incident

        Returns:
            The created Incident entity
        """
        pass

    @abstractmethod
    async def get_incidents_by_driver(
        self, driver_id: str
    ) -> list[Incident]:
        """
        Get all incidents reported by a specific driver.

        Args:
            driver_id: ID of the driver

        Returns:
            List of Incident entities
        """
        pass
