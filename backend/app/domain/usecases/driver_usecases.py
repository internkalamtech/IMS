"""Use cases for driver maintenance and compliance features."""

from app.domain.entities.driver import ComplianceDocument, MaintenanceTask
from app.domain.repositories.driver_repository import DriverRepository


class GetDriverDocumentsUseCase:
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
