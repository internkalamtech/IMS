"""
Database seeding script for demo data.

This script creates initial roles and demo users for development and testing.

Following best practices:
- Idempotent operations (can run multiple times safely)
- Proper error handling
- Logging for visibility
- Transaction management
"""

from app.infrastructure.database.models import TimetableModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import Logger
from app.core.password import hash_password
from app.infrastructure.database.database import AsyncSessionLocal, init_db
from app.infrastructure.database.models import RoleModel, UserModel


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
]

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


async def create_roles(db: AsyncSession) -> dict[str, RoleModel]:
    """
    Create roles if they don't exist.

    Args:
        db: Database session

    Returns:
        Dictionary mapping role names to RoleModel instances
    """
    Logger.info("Creating roles...")
    roles_map = {}

    for role_data in ROLES:
        # Check if role exists
        result = await db.execute(
            select(RoleModel).where(RoleModel.name == role_data["name"])
        )
        role = result.scalar_one_or_none()

        if not role:
            # Create new role
            role = RoleModel(**role_data)
            db.add(role)
            Logger.info(f"Created role: {role_data['name']}")
        else:
            Logger.info(f"Role already exists: {role_data['name']}")

        roles_map[role_data["name"]] = role

    await db.commit()
    return roles_map


async def create_users(
    db: AsyncSession, roles_map: dict[str, RoleModel]
) -> None:
    """
    Create demo users if they don't exist.

    Args:
        db: Database session
        roles_map: Dictionary mapping role names to RoleModel instances
    """
    Logger.info("Creating demo users...")

    for user_data in DEMO_USERS:
        # Check if user exists
        result = await db.execute(
            select(UserModel).where(UserModel.email == user_data["email"])
        )
        user = result.unique().scalar_one_or_none()

        if not user:
            # Hash password
            password_hash = hash_password(user_data["password"])

            # Create user
            user = UserModel(
                email=user_data["email"],
                password_hash=password_hash,
                name=user_data["name"],
                is_active=True,
            )

            # Assign roles
            for role_name in user_data["roles"]:
                if role_name in roles_map:
                    user.roles.append(roles_map[role_name])

            db.add(user)
            Logger.info(
                f"Created user: {user_data['email']} "
                f"with roles: {', '.join(user_data['roles'])}"
            )
        else:
            Logger.info(f"User already exists: {user_data['email']}")

    await db.commit()


async def seed_database() -> None:
    """
    Main function to seed the database.

    This function:
    1. Initializes database (creates tables)
    2. Creates roles
    3. Creates demo users
    """
    try:
        Logger.info("Starting database seeding...")

        # Initialize database (create tables)
        await init_db()
        Logger.info("Database tables created")

        # Create session
        async with AsyncSessionLocal() as db:
            # Create roles
            roles_map = await create_roles(db)

            # Create users
            await create_users(db, roles_map)

            from datetime import datetime
            timetable_rows = [
                TimetableModel(
                    teacher_id=2,
                    subject="Math",
                    room_type="101",
                    start_time=datetime(2026, 3, 19, 9, 0),
                    end_time=datetime(2026, 3, 19, 10, 0),
                ),
                TimetableModel(
                    teacher_id=2,
                    subject="English",
                    room_type="102",
                    start_time=datetime(2026, 3, 19, 10, 0),
                    end_time=datetime(2026, 3, 19, 11, 0),
                ),
            ]

            db.add_all(timetable_rows)
            await db.commit()

            Logger.info("Sample timetable data inserted!")
        Logger.info("Database seeding completed successfully!")

    except Exception as e:
        Logger.error(f"Error seeding database: {e}", exc_info=True)
        raise
