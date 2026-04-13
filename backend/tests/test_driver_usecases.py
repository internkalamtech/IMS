"""Tests for driver use cases."""

from app.domain.entities.driver import ComplianceDocument, MaintenanceTask
from app.domain.usecases.driver_usecases import (
    GetDriverDocumentsUseCase,
    GetDriverMaintenanceUseCase,
)


class FakeDriverRepository:
    """Simple in-memory repository for use case tests."""

    async def get_driver_documents(
        self, user_id: str
    ) -> list[ComplianceDocument]:
        return [
            ComplianceDocument(
                title="Driving License",
                expiry_date="2026-04-10",
            )
        ]

    async def get_driver_maintenance(
        self, user_id: str
    ) -> list[MaintenanceTask]:
        return [
            MaintenanceTask(
                title="Oil Change",
                date="2026-03-20",
                status="Scheduled",
            )
        ]


async def test_get_driver_documents_use_case_returns_documents():
    """Driver documents use case should delegate to the repository."""

    use_case = GetDriverDocumentsUseCase(FakeDriverRepository())

    documents = await use_case.execute("6")

    assert len(documents) == 1
    assert documents[0].title == "Driving License"
    assert documents[0].expiry_date == "2026-04-10"


async def test_get_driver_maintenance_use_case_returns_tasks():
    """Driver maintenance use case should delegate to the repository."""

    use_case = GetDriverMaintenanceUseCase(FakeDriverRepository())

    tasks = await use_case.execute("6")

    assert len(tasks) == 1
    assert tasks[0].title == "Oil Change"
    assert tasks[0].status == "Scheduled"
