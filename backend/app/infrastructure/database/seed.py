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
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import Logger
from app.core.password import hash_password
from app.infrastructure.database.database import AsyncSessionLocal, init_db
from app.infrastructure.database.models import (
    ClassSectionModel,
    RoleModel,
    StudentModel,
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

CLASS_SECTIONS = [
    {"name": "Grade 1"},
    {"name": "Grade 2"},
    {"name": "Grade 3"},
]

DEMO_STUDENTS = [
    {
        "name": "John Doe",
        "roll_number": "G1-001",
        "class_name": "Grade 1",
    },
    {
        "name": "Aarav Kumar",
        "roll_number": "G2-001",
        "class_name": "Grade 2",
    },
    {
        "name": "Bhavya Singh",
        "roll_number": "G3-001",
        "class_name": "Grade 3",
    },
]


def _student_seed_defaults() -> dict[str, Any]:
    """Return fallback values for required StudentModel fields in seed data."""
    defaults: dict[str, Any] = {}

    # If more non-nullable fields are added without defaults,
    # infer safe numeric/boolean seed values.
    for column in StudentModel.__table__.columns:
        if column.nullable or column.primary_key:
            continue
        if column.default is not None or column.server_default is not None:
            continue

        if column.name == "marks":
            defaults[column.name] = 0.0
            continue

        try:
            python_type = column.type.python_type
        except (AttributeError, NotImplementedError):
            continue

        if python_type is float:
            defaults[column.name] = 0.0
        elif python_type is int:
            defaults[column.name] = 0
        elif python_type is bool:
            defaults[column.name] = False

    return defaults


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


async def create_class_sections(db: AsyncSession) -> None:
    """
    Create demo class sections if they don't exist.

    Args:
        db: Database session
    """
    Logger.info("Creating class sections...")

    for class_data in CLASS_SECTIONS:
        result = await db.execute(
            select(ClassSectionModel).where(
                ClassSectionModel.name == class_data["name"]
            )
        )
        class_section = result.scalar_one_or_none()

        if not class_section:
            class_section = ClassSectionModel(**class_data)
            db.add(class_section)
            Logger.info(f"Created class section: {class_data['name']}")
        else:
            Logger.info(f"Class section already exists: {class_data['name']}")

    await db.commit()


async def create_demo_students(db: AsyncSession) -> None:
    """Create demo student records in the students table if missing."""
    Logger.info("Creating demo students...")
    student_defaults = _student_seed_defaults()

    class_sections_result = await db.execute(select(ClassSectionModel))
    class_sections = {
        class_section.name: class_section
        for class_section in class_sections_result.scalars().all()
    }

    for student_data in DEMO_STUDENTS:
        result = await db.execute(
            select(StudentModel).where(
                StudentModel.roll_number == student_data["roll_number"]
            )
        )
        student = result.scalar_one_or_none()

        if student:
            Logger.info(
                f"Student already exists: {student_data['roll_number']}"
            )
            continue

        class_section = class_sections.get(student_data["class_name"])
        student_payload: dict[str, Any] = {
            "name": student_data["name"],
            "roll_number": student_data["roll_number"],
            "class_id": class_section.id if class_section else None,
            "class_name": student_data["class_name"],
            "next_due_date": None,
        }

        for field_name, default_value in student_defaults.items():
            student_payload.setdefault(
                field_name,
                student_data.get(field_name, default_value),
            )

        student = StudentModel(**student_payload)
        db.add(student)
        Logger.info(
            "Created student: "
            f"{student_data['name']} ({student_data['roll_number']})"
        )

    await db.commit()


async def seed_database() -> None:
    """
    Main function to seed the database.

    This function:
    1. Initializes database (creates tables)
    2. Creates roles
    3. Creates demo users
    4. Creates demo class sections
    5. Creates demo students
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

            # Create class sections
            await create_class_sections(db)

            # Create demo students in students table
            await create_demo_students(db)

        Logger.info("Database seeding completed successfully!")

    except Exception as e:
        Logger.error(f"Error seeding database: {e}", exc_info=True)
        raise


if __name__ == "__main__":
    # Run seeding
    asyncio.run(seed_database())
