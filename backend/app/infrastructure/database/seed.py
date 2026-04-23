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

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import Logger
from app.core.password import hash_password
from app.infrastructure.database.database import AsyncSessionLocal, init_db
from app.infrastructure.database.models import (
    HomeworkModel,
    RoleModel,
    UserModel,
)

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


# Demo homework assignments for the student demo user
# These are tied to the student user by email lookup at seed time
DEMO_HOMEWORK = [
    {
        "subject": "Mathematics",
        "title": "Algebra Practice Set",
        "description": "Complete exercises 1–25 from chapter 4",
        "status": "pending",
    },
    {
        "subject": "Science",
        "title": "Project on Solar System",
        "description": "Submit detailed observations from the experiment",
        "status": "pending",
    },
    {
        "subject": "English",
        "title": "Essay – My Favourite Book",
        "description": "Write a 500-word essay on climate change impact",
        "status": "overdue",
    },
    {
        "subject": "Hindi",
        "title": "Grammar Exercise Page 45-47",
        "description": "Complete the grammar exercises",
        "status": "pending",
    },
    {
        "subject": "Social Studies",
        "title": "Map Work – Indian States",
        "description": "Complete the map work assignment",
        "status": "submitted",
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
    db: AsyncSession,
    roles_map: dict[str, RoleModel],
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


async def create_homework(db: AsyncSession) -> None:
    """
    Create demo homework assignments for the student demo user.

    Homework is assigned to the student@myuser.com user.
    Idempotent: only seeds if no homework records exist for that student.

    Args:
        db: Database session
    """
    Logger.info("Creating demo homework assignments...")

    # Find the student demo user
    result = await db.execute(
        select(UserModel).where(UserModel.email == "student@myuser.com")
    )
    student = result.unique().scalar_one_or_none()

    if not student:
        Logger.warning(
            "Student demo user not found — skipping homework seed"
        )
        return

    # Check if homework already seeded for this student
    existing = await db.execute(
        select(HomeworkModel).where(
            HomeworkModel.child_id == student.id
        )
    )
    if existing.scalars().first():
        Logger.info("Homework already seeded — skipping")
        return

    for hw_data in DEMO_HOMEWORK:
        homework = HomeworkModel(
            child_id=student.id,
            subject=hw_data["subject"],
            title=hw_data["title"],
            description=hw_data["description"],
            status=hw_data["status"],
        )
        db.add(homework)
        Logger.info(
            f"Created homework: '{hw_data['title']}' "
            f"(status: {hw_data['status']})"
        )

    await db.commit()


async def seed_database() -> None:
    """
    Main function to seed the database.

    This function:
    1. Initializes database (creates tables)
    2. Creates roles
    3. Creates demo users
    4. Creates demo homework assignments
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

            # Create homework assignments
            await create_homework(db)

        Logger.info("Database seeding completed successfully!")

    except Exception as e:
        Logger.error(f"Error seeding database: {e}", exc_info=True)
        raise


if __name__ == "__main__":
    # Run seeding
    asyncio.run(seed_database())
