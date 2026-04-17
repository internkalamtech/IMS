from app.domain.entities.driver import ComplianceDocument, MaintenanceTask
from app.domain.usecases.driver_usecases import (
    GetDriverDocumentsUseCase,
    GetDriverMaintenanceUseCase,
)


class FakeDriverRepository:
    async def get_driver_documents(self, user_id: str):
        return [ComplianceDocument(title="Driving License", expiry_date="2026-04-10")]

    async def get_driver_maintenance(self, user_id: str):
        return [MaintenanceTask(title="Oil Change", date="2026-03-20", status="Scheduled")]


async def test_get_driver_documents_use_case_returns_documents():
    use_case = GetDriverDocumentsUseCase(FakeDriverRepository())

    result = await use_case.execute("6")

    assert len(result) == 1
    assert result[0].title == "Driving License"


async def test_get_driver_maintenance_use_case_returns_tasks():
    use_case = GetDriverMaintenanceUseCase(FakeDriverRepository())

    result = await use_case.execute("6")

    assert len(result) == 1
    assert result[0].status == "Scheduled"
