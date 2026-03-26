"""
Database repository implementation for Incidents.

Implements the IncidentRepository interface using SQLAlchemy.
Follows the same pattern as database_auth_repository.py.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import Logger
from app.domain.entities.incident import Incident
from app.domain.repositories.incident_repository import (
    IncidentRepository,
    IncidentSeverity,
    IncidentType,
)
from app.infrastructure.database.database import AsyncSessionLocal
from app.infrastructure.database.models import IncidentModel


class DatabaseIncidentRepository(IncidentRepository):
    """SQLAlchemy implementation of IncidentRepository."""

    async def create_incident(
        self,
        driver_id: str,
        incident_type: IncidentType,
        severity: IncidentSeverity,
        description: str,
    ) -> Incident:
        """Create a new incident in the database."""
        async with AsyncSessionLocal() as db:
            incident_model = IncidentModel(
                driver_id=int(driver_id),
                type=incident_type,
                severity=severity,
                description=description,
                status="open",
            )
            db.add(incident_model)
            await db.commit()
            await db.refresh(incident_model)

            Logger.info(
                f"Created incident: id={incident_model.id}, "
                f"type={incident_type}, driver_id={driver_id}"
            )

            return self._to_entity(incident_model)

    async def get_incidents_by_driver(
        self, driver_id: str
    ) -> list[Incident]:
        """Get all incidents for a specific driver."""
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(IncidentModel)
                .where(IncidentModel.driver_id == int(driver_id))
                .order_by(IncidentModel.created_at.desc())
            )
            incidents = result.scalars().all()

            Logger.info(
                f"Retrieved {len(incidents)} incidents "
                f"for driver_id={driver_id}"
            )

            return [self._to_entity(i) for i in incidents]

    @staticmethod
    def _to_entity(model: IncidentModel) -> Incident:
        """Convert a database model to a domain entity."""
        return Incident(
            id=str(model.id),
            driver_id=str(model.driver_id),
            type=model.type,
            severity=model.severity,
            description=model.description,
            status=model.status,
            created_at=model.created_at,
        )
