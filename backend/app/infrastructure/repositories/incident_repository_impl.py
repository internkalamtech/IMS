"""
Database-backed implementation of IncidentRepository.

Following Clean Architecture principles:
- Implements the domain IncidentRepository interface
- Uses SQLAlchemy ORM for async database operations
- Maps between database models and domain entities
- Proper error handling and logging
"""

from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import DatabaseError
from app.core.logger import Logger
from app.domain.entities.incident import Incident, IncidentSeverity, IncidentType
from app.domain.repositories.incident_repository import IncidentRepository
from app.infrastructure.database.models import IncidentModel


class DatabaseIncidentRepository(IncidentRepository):
    """
    Database-backed implementation of IncidentRepository.

    Uses PostgreSQL with SQLAlchemy for data persistence and async operations.
    Handles creation and retrieval of incident logs.
    """

    def __init__(self, db_session: AsyncSession) -> None:
        """
        Initialize repository with database session.

        Args:
            db_session: SQLAlchemy async session for database operations
        """
        self.db = db_session

    async def create_incident(self, incident: Incident) -> Incident:
        """
        Persist a new incident log to the database.

        Args:
            incident: Incident domain entity to be created

        Returns:
            Incident entity with database ID and timestamps set

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            Logger.info(
                f"Creating incident: type={incident.type.value}, "
                f"severity={incident.severity.value}, "
                f"driver_id={incident.driver_id}"
            )

            db_incident = IncidentModel(
                driver_id=int(incident.driver_id),
                type=incident.type.value,
                severity=incident.severity.value,
                description=incident.description,
                status="open",
                latitude=incident.latitude,
                longitude=incident.longitude,
            )

            self.db.add(db_incident)
            await self.db.flush()

            # Update domain entity with database-generated values
            incident.id = str(db_incident.id)
            incident.created_at = db_incident.created_at
            incident.updated_at = db_incident.updated_at

            Logger.info(f"Incident created successfully with ID: {db_incident.id}")
            return incident

        except Exception as e:
            Logger.error(f"Database error creating incident: {e}", exc_info=True)
            raise DatabaseError(f"Failed to create incident: {str(e)}")

    async def get_incident(self, incident_id: str) -> Optional[Incident]:
        """
        Retrieve an incident by ID.

        Args:
            incident_id: Unique identifier of the incident

        Returns:
            Incident entity if found, None otherwise

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            Logger.info(f"Fetching incident with ID: {incident_id}")

            result = await self.db.execute(
                select(IncidentModel).where(IncidentModel.id == int(incident_id))
            )
            db_incident = result.scalar_one_or_none()

            if not db_incident:
                Logger.warning(f"Incident not found with ID: {incident_id}")
                return None

            Logger.info(f"Incident retrieved successfully: {incident_id}")
            return self._model_to_entity(db_incident)

        except ValueError:
            Logger.warning(f"Invalid incident ID format: {incident_id}")
            return None
        except Exception as e:
            Logger.error(f"Database error fetching incident: {e}", exc_info=True)
            raise DatabaseError(f"Failed to fetch incident: {str(e)}")

    async def get_driver_incidents(self, driver_id: str) -> List[Incident]:
        """
        Retrieve all incidents reported by a specific driver, newest first.

        Args:
            driver_id: ID of the driver

        Returns:
            List of Incident entities ordered by creation date descending

        Raises:
            DatabaseError: If database operation fails
        """
        # Validate and convert driver_id before hitting the DB
        try:
            driver_id_int = int(driver_id)
        except (ValueError, TypeError):
            Logger.warning(f"Invalid driver ID format: {driver_id}")
            return []

        try:
            Logger.info(f"Fetching incidents for driver {driver_id_int}")

            result = await self.db.execute(
                select(IncidentModel)
                .where(IncidentModel.driver_id == driver_id_int)
                .order_by(IncidentModel.created_at.desc())
            )
            db_incidents = result.scalars().all()

            incidents = [self._model_to_entity(i) for i in db_incidents]

            Logger.info(
                f"Retrieved {len(incidents)} incidents for driver {driver_id_int}"
            )
            return incidents

        except Exception as e:
            Logger.error(f"Database error fetching driver incidents: {e}", exc_info=True)
            raise DatabaseError(f"Failed to fetch driver incidents: {str(e)}")

    @staticmethod
    def _model_to_entity(db_incident: IncidentModel) -> Incident:
        """
        Convert a database model instance to a domain entity.

        Args:
            db_incident: SQLAlchemy IncidentModel instance

        Returns:
            Incident domain entity
        """
        return Incident(
            id=str(db_incident.id),
            driver_id=str(db_incident.driver_id),
            type=IncidentType(db_incident.type.title()),        # normalize: 'breakdown' → 'Breakdown'
            severity=IncidentSeverity(db_incident.severity.title()),  # normalize: 'high' → 'High'
            description=db_incident.description,
            status=db_incident.status,
            latitude=db_incident.latitude,
            longitude=db_incident.longitude,
            created_at=db_incident.created_at,
            updated_at=db_incident.updated_at,
        )
