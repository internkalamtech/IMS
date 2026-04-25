"""
backend/app/domain/entities/user_entity.py
PHASE_3: User Management - User Onboarding (5 Stories)
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional, List


class UserRole(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    PARENT = "parent"
    STUDENT = "student"
    DRIVER = "driver"
    STAFF = "staff"


class UserStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


@dataclass
class UserEntity:
    id: str
    email: str
    name: str
    phone: str
    role: UserRole
    status: UserStatus = UserStatus.PENDING
    employee_id: Optional[str] = None
    department: Optional[str] = None
    date_of_joining: Optional[datetime] = None
    profile_photo_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    permissions: List[str] = None
    is_deleted: bool = False
    
    def __post_init__(self):
        if not self.permissions:
            self.permissions = []
    
    def validate(self) -> None:
        if not self.email or "@" not in self.email:
            raise ValueError("Valid email required")
        if not self.name or len(self.name) < 2:
            raise ValueError("Valid name required")
        if not self.phone or len(self.phone) < 10:
            raise ValueError("Valid phone number required")
