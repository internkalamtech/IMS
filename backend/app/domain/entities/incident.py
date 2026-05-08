"""
Incident domain entity.

Represents a driver-reported incident with geographic coordinates.
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional


class IncidentType(str, Enum):
    """Type of incident reported by driver."""
    BREAKDOWN = "Breakdown"
    ACCIDENT = "Accident"
    DELAY = "Delay"


class IncidentSeverity(str, Enum):
    """Severity level of the incident."""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


@dataclass
class Incident:
    """Domain entity for a driver-reported incident."""

    id: str
    driver_id: str
    type: IncidentType
    severity: IncidentSeverity
    description: str
    status: str = "open"  # 'open' | 'resolved'

    # Geographic coordinates (required per issue #281)
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def is_high_severity(self) -> bool:
        """Check if the incident requires immediate attention."""
        return self.severity == IncidentSeverity.HIGH

    def __repr__(self) -> str:
        return (
            f"<Incident(id={self.id}, "
            f"driver_id={self.driver_id}, "
            f"type='{self.type.value}', "
            f"severity='{self.severity.value}')>"
        )
