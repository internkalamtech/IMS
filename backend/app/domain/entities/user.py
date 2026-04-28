"""
Domain entities for the IMS Backend.

Entities represent core business objects with no dependencies
on external frameworks.
"""

from dataclasses import dataclass
from typing import Literal

# Type alias for user roles
UserRole = Literal["admin", "teacher", "student", "parent", "transport", "driver"]


@dataclass
class Role:
    """
    Role entity.

    Attributes:
        id: Unique identifier for the role
        name: Role name (admin, teacher, student, parent, transport, driver)
        description: Optional description of the role
    """

    id: str
    name: UserRole
    description: str | None = None


@dataclass
class User:
    """
    User entity representing a user in the system.

    Attributes:
        id: Unique identifier for the user
        name: Full name of the user
        email: Email address (used for login)
        role: Primary user role (for backward compatibility)
        roles: List of all roles assigned to the user
        avatar_url: Optional URL to user's avatar image
    """

    id: str
    name: str
    email: str
    role: UserRole  # Primary role (first role in roles list)
    roles: list[Role]  # All roles assigned to user
    avatar_url: str | None = None

    def to_dict(self) -> dict:
        """Convert entity to dictionary representation."""
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "roles": [
                {"id": r.id, "name": r.name, "description": r.description} for r in self.roles
            ],
            "avatarUrl": self.avatar_url,
        }
