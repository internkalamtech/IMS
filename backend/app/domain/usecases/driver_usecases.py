"""Use cases for driver maintenance and compliance features."""

from app.domain.entities.driver import ComplianceDocument, MaintenanceTask
from app.domain.repositories.driver_repository import DriverRepository


def _normalize_driver_id(driver_id: int | str) -> int:
    """Accept legacy string ids while enforcing a positive integer value."""
    normalized_id = int(driver_id)
    if normalized_id <= 0:
        raise ValueError("Invalid driver id")
    return normalized_id


class GetDriverDocumentsUseCase:
    """Use case for retrieving compliance documents for a driver."""

    def __init__(self, repository: DriverRepository) -> None:
        self.repository = repository

    async def execute(self, driver_id: int | str) -> list[ComplianceDocument]:
        normalized_id = _normalize_driver_id(driver_id)
        return await self.repository.get_driver_documents(normalized_id)


class GetDriverMaintenanceUseCase:
    """Use case for retrieving maintenance tasks for a driver."""

    def __init__(self, repository: DriverRepository) -> None:
        self.repository = repository

    async def execute(self, driver_id: int | str) -> list[MaintenanceTask]:
        normalized_id = _normalize_driver_id(driver_id)
        return await self.repository.get_driver_maintenance_tasks(normalized_id)
