"""Database-backed implementation of driver repository operations."""

from sqlalchemy import Integer, String, column, select, table
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import DatabaseError
from app.core.logger import Logger
from app.domain.entities.driver import ComplianceDocument, MaintenanceTask
from app.domain.repositories.driver_repository import DriverRepository

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
)


class DatabaseDriverRepository(DriverRepository):
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
