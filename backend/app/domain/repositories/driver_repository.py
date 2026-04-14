"""Abstract repository interface for driver operations."""

from abc import ABC, abstractmethod

from app.domain.entities.driver import ComplianceDocument, MaintenanceTask


class DriverRepository(ABC):
    """Repository contract for driver maintenance and compliance data."""

    @abstractmethod
    async def get_driver_documents(
        self, driver_id: int
    ) -> list[ComplianceDocument]:
        """Return compliance documents for the driver's assigned vehicle."""

    @abstractmethod
    async def get_driver_maintenance_tasks(
        self, driver_id: int
    ) -> list[MaintenanceTask]:
        """Return maintenance tasks for the driver's assigned vehicle."""
