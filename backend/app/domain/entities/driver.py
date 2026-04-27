"""Driver-facing compliance and maintenance domain entities."""

from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class ComplianceDocument:
    """A driver's personal or assigned-vehicle compliance document."""

    title: str
    expiry_date: date


@dataclass(frozen=True)
class MaintenanceTask:
    """A maintenance task for a driver's assigned vehicle."""

    title: str
    scheduled_date: date
    status: str
