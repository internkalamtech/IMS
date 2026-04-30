"""
Incident repository interface (contract).

Defines the operations available for managing incident records.
"""

from abc import ABC, abstractmethod
from typing import List, Optional

from app.domain.entities.incident import Incident


class IncidentRepository(ABC):
    """Abstract repository for Incident operations."""

    @abstractmethod
    async def create_incident(self, incident: Incident) -> Incident:
        """Create and persist a new incident log."""
        pass

    @abstractmethod
    async def get_incident(self, incident_id: str) -> Optional[Incident]:
        """Get an incident by its ID."""
        pass

    @abstractmethod
    async def get_driver_incidents(self, driver_id: str) -> List[Incident]:
        """Get all incidents reported by a specific driver, newest first."""
        pass
