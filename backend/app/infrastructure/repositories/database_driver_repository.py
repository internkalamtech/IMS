<<<<<<< HEAD
"""Database-backed repository for driver maintenance and compliance data."""

from sqlalchemy import select
=======
"""Database-backed implementation of driver repository operations."""

from sqlalchemy import Integer, String, column, select, table
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import DatabaseError
from app.core.logger import Logger
from app.domain.entities.driver import ComplianceDocument, MaintenanceTask
from app.domain.repositories.driver_repository import DriverRepository
<<<<<<< HEAD
from app.infrastructure.database.models import (
    DriverVehicleAssignmentModel,
    VehicleComplianceDocumentModel,
    VehicleMaintenanceTaskModel,
=======

driver_documents_table = table(
    "vehicle_compliance_documents",
    column("driver_id", Integer),
    column("title", String),
    column("expiry_date"),
)

driver_maintenance_table = table(
    "vehicle_maintenance_tasks",
    column("driver_id", Integer),
    column("title", String),
    column("scheduled_date"),
    column("status", String),
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
)


class DatabaseDriverRepository(DriverRepository):
<<<<<<< HEAD
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
                "Database error getting driver documents for user "
                f"{user_id}: {exc}",
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
                .order_by(VehicleMaintenanceTaskModel.scheduled_date.asc())
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
                "Database error getting driver maintenance for user "
                f"{user_id}: {exc}",
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
=======
    """Fetch driver maintenance and compliance data from the database."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_driver_documents(
        self, driver_id: int
    ) -> list[ComplianceDocument]:
        try:
            result = await self.db.execute(
                select(
                    driver_documents_table.c.title,
                    driver_documents_table.c.expiry_date,
                )
                .where(driver_documents_table.c.driver_id == driver_id)
                .order_by(driver_documents_table.c.expiry_date.asc())
            )

            return [
                ComplianceDocument(
                    title=row.title,
                    expiry_date=row.expiry_date,
                )
                for row in result.all()
            ]
        except Exception as exc:
            Logger.error(
                f"Failed to fetch driver documents for user {driver_id}: {exc}",
                exc_info=True,
            )
            raise DatabaseError("Failed to fetch driver documents") from exc

    async def get_driver_maintenance_tasks(
        self, driver_id: int
    ) -> list[MaintenanceTask]:
        try:
            result = await self.db.execute(
                select(
                    driver_maintenance_table.c.title,
                    driver_maintenance_table.c.scheduled_date,
                    driver_maintenance_table.c.status,
                )
                .where(driver_maintenance_table.c.driver_id == driver_id)
                .order_by(driver_maintenance_table.c.scheduled_date.desc())
            )

            return [
                MaintenanceTask(
                    title=row.title,
                    scheduled_date=row.scheduled_date,
                    status=row.status,
                )
                for row in result.all()
            ]
        except Exception as exc:
            Logger.error(
                f"Failed to fetch driver maintenance for user {driver_id}: {exc}",
                exc_info=True,
            )
            raise DatabaseError("Failed to fetch driver maintenance tasks") from exc
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
