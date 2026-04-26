"""Repository contract for driver compliance features."""

from abc import ABC, abstractmethod

from app.domain.entities.driver import ComplianceDocument, MaintenanceTask


class DriverRepository(ABC):
    """Persistence boundary for driver-scoped vehicle data."""

    @abstractmethod
    async def get_driver_documents(
        self, driver_id: int
    ) -> list[ComplianceDocument]:
        """Return compliance documents for a driver's assigned vehicle."""

    @abstractmethod
    async def get_driver_maintenance_tasks(
        self, driver_id: int
    ) -> list[MaintenanceTask]:
        """Return maintenance tasks for a driver's assigned vehicle."""
