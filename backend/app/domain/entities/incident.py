"""
Domain entity for Incidents.

Represents an incident reported by a driver,
such as a vehicle breakdown, accident, or delay.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Literal


# Type aliases for incident fields
IncidentType = Literal["breakdown", "accident", "delay"]
IncidentSeverity = Literal["low", "medium", "high", "critical"]
IncidentStatus = Literal["open", "acknowledged", "resolved"]


@dataclass
class Incident:
    """
    Incident entity.

    Attributes:
        id: Unique identifier for the incident
        driver_id: ID of the driver who reported the incident
        type: Type of incident (breakdown, accident, delay)
        severity: Severity level (low, medium, high, critical)
        description: Free-text description of the incident
        status: Current status (open, acknowledged, resolved)
        created_at: When the incident was reported
    """

    id: str
    driver_id: str
    type: IncidentType
    severity: IncidentSeverity
    description: str
    status: IncidentStatus = "open"
    created_at: datetime | None = None

    def to_dict(self) -> dict:
        """Convert entity to dictionary representation."""
        return {
            "id": self.id,
            "driver_id": self.driver_id,
            "type": self.type,
            "severity": self.severity,
            "description": self.description,
            "status": self.status,
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),
        }
