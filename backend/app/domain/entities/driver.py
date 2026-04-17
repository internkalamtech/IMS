<<<<<<< HEAD
"""Domain entities for driver maintenance and compliance data."""

from dataclasses import dataclass
=======
"""Driver-related domain entities."""

from dataclasses import dataclass
from datetime import date
from typing import Literal


MaintenanceStatus = Literal["Scheduled", "In Progress", "Completed"]
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89


@dataclass
class ComplianceDocument:
<<<<<<< HEAD
    """A vehicle compliance document visible to a driver."""

    title: str
    expiry_date: str
=======
    """Compliance document linked to a driver's assigned vehicle."""

    title: str
    expiry_date: date
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89


@dataclass
class MaintenanceTask:
<<<<<<< HEAD
    """A maintenance task for the driver's assigned vehicle."""

    title: str
    date: str
    status: str
=======
    """Maintenance task linked to a driver's assigned vehicle."""

    title: str
    scheduled_date: date
    status: MaintenanceStatus
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
