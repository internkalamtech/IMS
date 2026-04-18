"""
Database seeding script for demo data.

This script creates initial roles and demo users for development and testing.

Following best practices:
- Idempotent operations (can run multiple times safely)
- Proper error handling
- Logging for visibility
- Transaction management
"""

import asyncio
from datetime import datetime, timedelta
import calendar as cal_lib
import random  # noqa: F401 kept for future use

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import Logger
from app.core.password import hash_password
from app.infrastructure.database.database import AsyncSessionLocal, init_db
from app.infrastructure.database.models import (
    AttendanceModel,
    LeaveRequestModel,
    RoleModel,
    UserModel,
    parent_student,
)

# Roles configuration
ROLES = [
    {
        "name": "admin",
        "description": "Administrator with full system access",
    },
    {
        "name": "teacher",
        "description": "Teacher with access to classes and students",
    },
    {
        "name": "parent",
        "description": ("Parent with access to their children's information"),
    },
    {
        "name": "student",
        "description": "Student with access to their own information",
    },
    {
        "name": "transport",
        "description": (
            "Transport manager with access to routes and vehicles"
        ),
    },
    {
        "name": "driver",
        "description": "Driver with access to assigned routes",
    },
]

# Demo users configuration
DEMO_USERS = [
    {
        "email": "admin@myuser.com",
        "password": "admin123",
        "name": "Admin User",
        "roles": ["admin"],
    },
    {
        "email": "teacher@myuser.com",
        "password": "teacher123",
        "name": "Teacher User",
        "roles": ["teacher"],
    },
    {
        "email": "parent@myuser.com",
        "password": "parent123",
        "name": "Parent User",
        "roles": ["parent"],
    },
    {
        "email": "student@myuser.com",
        "password": "student123",
        "name": "Student User",
        "roles": ["student"],
    },
    {
        "email": "transport@myuser.com",
        "password": "transport123",
        "name": "Transport Manager",
        "roles": ["transport"],
    },
    {
        "email": "driver@myuser.com",
        "password": "driver123",
        "name": "Driver User",
        "roles": ["driver"],
    },
    # Multi-role users
    {
        "email": "john@myuser.com",
        "password": "john123",
        "name": "John Smith",
        "roles": ["parent", "teacher"],
    },
    {
        "email": "maria@myuser.com",
        "password": "maria123",
        "name": "Maria Garcia",
        "roles": ["parent", "teacher"],
    },
    # Demo children for parent@myuser.com
    {
        "email": "aarav@myuser.com",
        "password": "aarav123",
        "name": "Aarav Kumar",
        "roles": ["student"],
        "grade": "Class 7A",
        "rollNo": "101",
        "emoji": "👦",
    },
    {
        "email": "priya@myuser.com",
        "password": "priya123",
        "name": "Priya Kumar",
        "roles": ["student"],
        "grade": "Class 5B",
        "rollNo": "45",
        "emoji": "👧",
    },
    {
        "email": "ravi@myuser.com",
        "password": "ravi123",
        "name": "Ravi Kumar",
        "roles": ["student"],
        "grade": "Class 9C",
        "rollNo": "22",
        "emoji": "🧒",
    },
]

# Emails of children that belong to parent@myuser.com
PARENT_EMAIL = "parent@myuser.com"
CHILDREN_EMAILS = ["aarav@myuser.com", "priya@myuser.com", "ravi@myuser.com"]