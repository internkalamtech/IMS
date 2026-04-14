"""
Parent domain entity.

Represents a parent/guardian in the system with no framework dependencies.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Parent:
    """
    Parent entity representing a guardian/parent of one or more students.

    Attributes:
        id: Unique identifier for the parent
        name: Full name of the parent/guardian
        phone: Contact phone number
        email: Email address (unique, used for communication)
        relationship_type: Relationship to student (e.g., Father, Mother, Guardian)
        is_active: Whether the parent account is active
        user_id: Associated user account ID (optional, foreign key to users table)
        created_at: Timestamp when parent account was created
        updated_at: Timestamp of last update
    """

    id: int
    name: str
    phone: str
    email: str
    relationship_type: str
    is_active: bool = True
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
