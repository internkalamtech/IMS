"""Database-backed repository for driver maintenance and compliance data."""

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
    """Read driver compliance and maintenance data from the database."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_driver_documents(
        self, user_id: str
    ) -> list[ComplianceDocument]:
        try:
            vehicle_id = await self._get_assigned_vehicle_id(user_id)
            if vehicle_id is None:
                return []

            result = await self.db.execute(
                select(VehicleComplianceDocumentModel)
                .where(VehicleComplianceDocumentModel.vehicle_id == vehicle_id)
                .order_by(VehicleComplianceDocumentModel.expiry_date.asc())
            )
            documents = result.scalars().all()
            return [
                ComplianceDocument(
                    title=document.title,
                    expiry_date=document.expiry_date.isoformat(),
                )
                for document in documents
            ]
        except DatabaseError:
            raise
        except Exception as exc:
            Logger.error(
                f"Database error getting driver documents for user {user_id}: {exc}",
                exc_info=True,
            )
            raise DatabaseError("Failed to retrieve driver documents")

    async def get_driver_maintenance(
        self, user_id: str
    ) -> list[MaintenanceTask]:
        try:
            vehicle_id = await self._get_assigned_vehicle_id(user_id)
            if vehicle_id is None:
                return []

            result = await self.db.execute(
                select(VehicleMaintenanceTaskModel)
                .where(VehicleMaintenanceTaskModel.vehicle_id == vehicle_id)
                .order_by(VehicleMaintenanceTaskModel.scheduled_date.desc())
            )
            tasks = result.scalars().all()
            return [
                MaintenanceTask(
                    title=task.title,
                    date=task.scheduled_date.isoformat(),
                    status=task.status,
                )
                for task in tasks
            ]
        except DatabaseError:
            raise
        except Exception as exc:
            Logger.error(
                f"Database error getting driver maintenance for user {user_id}: {exc}",
                exc_info=True,
            )
            raise DatabaseError("Failed to retrieve maintenance tasks")

    async def _get_assigned_vehicle_id(self, user_id: str) -> int | None:
        result = await self.db.execute(
            select(DriverVehicleAssignmentModel.vehicle_id).where(
                DriverVehicleAssignmentModel.user_id == int(user_id)
            )
        )
        return result.scalar_one_or_none()
