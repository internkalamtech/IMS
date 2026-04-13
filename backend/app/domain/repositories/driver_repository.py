"""Repository interfaces for driver-specific data access."""

from abc import ABC, abstractmethod

from app.domain.entities.driver import ComplianceDocument, MaintenanceTask


class DriverRepository(ABC):
    """Abstract repository for driver compliance and maintenance data."""

    @abstractmethod
    async def get_driver_documents(
        self, user_id: str
    ) -> list[ComplianceDocument]:
        """Return compliance documents for the driver's assigned vehicle."""
        pass

    @abstractmethod
    async def get_driver_maintenance(
        self, user_id: str
    ) -> list[MaintenanceTask]:
        """Return maintenance tasks for the driver's assigned vehicle."""
        pass
