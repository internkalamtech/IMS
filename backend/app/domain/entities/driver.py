"""Driver-related domain entities."""

from dataclasses import dataclass
from datetime import date
from typing import Literal


MaintenanceStatus = Literal["Scheduled", "In Progress", "Completed"]


@dataclass
class ComplianceDocument:
    """Compliance document linked to a driver's assigned vehicle."""

    title: str
    expiry_date: date


@dataclass
class MaintenanceTask:
    """Maintenance task linked to a driver's assigned vehicle."""

    title: str
    scheduled_date: date
    status: MaintenanceStatus
