"""Use cases for driver maintenance and compliance features."""

from app.domain.entities.driver import ComplianceDocument, MaintenanceTask
from app.domain.repositories.driver_repository import DriverRepository


class GetDriverDocumentsUseCase:
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
