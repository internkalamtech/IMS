"""
Domain entities for the IMS Backend.

Entities represent core business objects with no dependencies
on external frameworks.
"""

from dataclasses import dataclass
from typing import Literal


# Type alias for user roles
UserRole = Literal[
    "admin", "teacher", "student", "parent", "transport", "driver"
]


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
                {"id": r.id, "name": r.name, "description": r.description}
                for r in self.roles
            ],
            "avatarUrl": self.avatar_url,
        }


@dataclass
class StudentProfile:
    """
    Student-specific profile data.

    Attributes:
        user_id: Reference to the user
        roll_number: Student roll number
        class_assigned: Class/section assigned
        date_of_birth: Date of birth
        blood_group: Blood group
        parent_id: Reference to parent user
    """
    user_id: str
    roll_number: str
    class_assigned: str
    date_of_birth: str | None = None
    blood_group: str | None = None
    parent_id: str | None = None


@dataclass
class TeacherProfile:
    """
    Teacher-specific profile data.

    Attributes:
        user_id: Reference to the user
        subjects: List of subjects taught
        classes_assigned: List of classes assigned
        employee_id: Employee ID
    """
    user_id: str
    subjects: list[str]
    classes_assigned: list[str]
    employee_id: str | None = None


@dataclass
class ParentProfile:
    """
    Parent-specific profile data.

    Attributes:
        user_id: Reference to the user
        phone: Contact phone number
        children_ids: List of student user IDs
    """
    user_id: str
    phone: str
    children_ids: list[str]


@dataclass
class TransportProfile:
    """
    Transport staff-specific profile data.

    Attributes:
        user_id: Reference to the user
        license_number: Driving license number
        vehicle_assigned: Vehicle assigned
        employee_id: Employee ID
    """
    user_id: str
    license_number: str | None = None
    vehicle_assigned: str | None = None
    employee_id: str | None = None
