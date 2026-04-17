<<<<<<< HEAD
"""Repository interfaces for driver-specific data access."""
=======
"""Abstract repository interface for driver operations."""
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89

from abc import ABC, abstractmethod

from app.domain.entities.driver import ComplianceDocument, MaintenanceTask


class DriverRepository(ABC):
<<<<<<< HEAD
    """Abstract repository for driver compliance and maintenance data."""

    @abstractmethod
    async def get_driver_documents(
        self, user_id: str
=======
    """Repository contract for driver maintenance and compliance data."""

    @abstractmethod
    async def get_driver_documents(
        self, driver_id: int
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
    ) -> list[ComplianceDocument]:
        """Return compliance documents for the driver's assigned vehicle."""

    @abstractmethod
<<<<<<< HEAD
    async def get_driver_maintenance(
        self, user_id: str
=======
    async def get_driver_maintenance_tasks(
        self, driver_id: int
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
    ) -> list[MaintenanceTask]:
        """Return maintenance tasks for the driver's assigned vehicle."""
