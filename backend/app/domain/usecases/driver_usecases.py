"""Use cases for driver maintenance and compliance features."""

from app.domain.entities.driver import ComplianceDocument, MaintenanceTask
from app.domain.repositories.driver_repository import DriverRepository


class GetDriverDocumentsUseCase:
<<<<<<< HEAD
    """Retrieve compliance documents for a driver's assigned vehicle."""

    def __init__(self, driver_repository: DriverRepository):
        self.driver_repository = driver_repository

    async def execute(self, user_id: str) -> list[ComplianceDocument]:
        return await self.driver_repository.get_driver_documents(user_id)


class GetDriverMaintenanceUseCase:
    """Retrieve maintenance tasks for a driver's assigned vehicle."""

    def __init__(self, driver_repository: DriverRepository):
        self.driver_repository = driver_repository

    async def execute(self, user_id: str) -> list[MaintenanceTask]:
        return await self.driver_repository.get_driver_maintenance(user_id)
=======
    """Use case for retrieving compliance documents for a driver."""

    def __init__(self, repository: DriverRepository) -> None:
        self.repository = repository

    async def execute(self, driver_id: int) -> list[ComplianceDocument]:
        if driver_id <= 0:
            raise ValueError("Invalid driver id")
        return await self.repository.get_driver_documents(driver_id)


class GetDriverMaintenanceUseCase:
    """Use case for retrieving maintenance tasks for a driver."""

    def __init__(self, repository: DriverRepository) -> None:
        self.repository = repository

    async def execute(self, driver_id: int) -> list[MaintenanceTask]:
        if driver_id <= 0:
            raise ValueError("Invalid driver id")
        return await self.repository.get_driver_maintenance_tasks(driver_id)
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
