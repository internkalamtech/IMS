"""Domain entities for driver maintenance and compliance data."""

from dataclasses import dataclass


@dataclass
class ComplianceDocument:
    """A vehicle compliance document visible to a driver."""

    title: str
    expiry_date: str


@dataclass
class MaintenanceTask:
    """A maintenance task for the driver's assigned vehicle."""

    title: str
    date: str
    status: str
