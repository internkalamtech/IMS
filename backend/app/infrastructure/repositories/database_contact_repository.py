"""
Database-backed implementation of ContactRepository.

Persists contact (name, email) data to PostgreSQL using SQLAlchemy.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import DatabaseError
from app.core.logger import Logger
from app.domain.entities.contact import Contact
from app.domain.repositories.contact_repository import ContactRepository
from app.infrastructure.database.models import ContactModel


class DatabaseContactRepository(ContactRepository):
    """
    Database-backed implementation of ContactRepository.

    Uses PostgreSQL with SQLAlchemy for data persistence.
    """

    def __init__(self, db: AsyncSession):
        """
        Initialize repository with database session.

        Args:
            db: SQLAlchemy async session
        """
        self.db = db

    async def create(self, name: str, email: str) -> Contact:
        """
        Create and persist a new contact.

        Args:
            name: Contact name
            email: Contact email address

        Returns:
            Created Contact entity

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            model = ContactModel(
                name=name.strip(), email=email.strip().lower()
            )
            self.db.add(model)
            await self.db.flush()  # Get the ID without committing
            await self.db.refresh(model)

            contact = Contact(
                id=model.id,
                name=model.name,
                email=model.email,
                created_at=model.created_at,
            )
            Logger.info(f"Contact created: id={model.id}, email={model.email}")
            return contact

        except Exception as e:
            Logger.error(
                f"Database error creating contact: {e}", exc_info=True
            )
            raise DatabaseError(f"Failed to save contact: {str(e)}")
