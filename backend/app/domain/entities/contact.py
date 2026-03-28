"""
Domain entity for Contact.

Represents a contact (name and email) submitted via the dashboard.
"""

from dataclasses import dataclass
from datetime import datetime


@dataclass
class Contact:
    """
    Contact entity.

    Attributes:
        id: Unique identifier
        name: Contact name
        email: Contact email address
        created_at: Timestamp when the contact was created
    """

    id: int
    name: str
    email: str
    created_at: datetime
