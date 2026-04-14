"""Database-backed implementation of driver repository operations."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import DatabaseError
from app.core.logger import Logger
from app.domain.entities.driver import ComplianceDocument, MaintenanceTask
from app.domain.repositories.driver_repository import DriverRepository
from app.infrastructure.database.models import (
    DriverVehicleAssignmentModel,
    VehicleComplianceDocumentModel,
    VehicleMaintenanceTaskModel,
)


class DatabaseDriverRepository(DriverRepository):
    """Fetch driver maintenance and compliance data from the database."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_driver_documents(
        self, driver_id: int
    ) -> list[ComplianceDocument]:
        try:
            vehicle_id = await self._get_vehicle_id_for_driver(driver_id)
            if vehicle_id is None:
                return []

            result = await self.db.execute(
                select(VehicleComplianceDocumentModel)
                .where(VehicleComplianceDocumentModel.vehicle_id == vehicle_id)
                .order_by(VehicleComplianceDocumentModel.expiry_date.asc())
            )
            document_models = result.scalars().all()

            return [
                ComplianceDocument(
                    title=document.title,
                    expiry_date=document.expiry_date,
                )
                for document in document_models
            ]
        except Exception as exc:
            Logger.error(
                f"Failed to fetch driver documents for user {driver_id}: {exc}",
                exc_info=True,
            )
            raise DatabaseError("Failed to fetch driver documents")

    async def get_driver_maintenance_tasks(
        self, driver_id: int
    ) -> list[MaintenanceTask]:
        try:
            vehicle_id = await self._get_vehicle_id_for_driver(driver_id)
            if vehicle_id is None:
                return []

            result = await self.db.execute(
                select(VehicleMaintenanceTaskModel)
                .where(VehicleMaintenanceTaskModel.vehicle_id == vehicle_id)
                .order_by(VehicleMaintenanceTaskModel.scheduled_date.desc())
            )
            task_models = result.scalars().all()

            return [
                MaintenanceTask(
                    title=task.title,
                    scheduled_date=task.scheduled_date,
                    status=task.status,
                )
                for task in task_models
            ]
        except Exception as exc:
            Logger.error(
                f"Failed to fetch driver maintenance for user {driver_id}: {exc}",
                exc_info=True,
            )
            raise DatabaseError("Failed to fetch driver maintenance tasks")

    async def _get_vehicle_id_for_driver(self, driver_id: int) -> int | None:
        result = await self.db.execute(
            select(DriverVehicleAssignmentModel.vehicle_id).where(
                DriverVehicleAssignmentModel.user_id == driver_id
            )
        )
        return result.scalar_one_or_none()
