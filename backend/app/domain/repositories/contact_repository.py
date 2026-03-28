"""
Repository interface for contact data access.
"""

from abc import ABC, abstractmethod

from app.domain.entities.contact import Contact


class ContactRepository(ABC):
    """
    Abstract repository for contact operations.

    Defines the contract for persisting contact (name, email) data.
    """

    @abstractmethod
    async def create(self, name: str, email: str) -> Contact:
        """
        Create and persist a new contact.

        Args:
            name: Contact name
            email: Contact email address

        Returns:
            Created Contact entity
        """
        pass
