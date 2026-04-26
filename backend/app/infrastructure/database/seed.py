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

from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import Logger
from app.core.password import hash_password
from app.infrastructure.database.database import AsyncSessionLocal, init_db
from app.infrastructure.database.models import (
    AttendanceModel,
    LeaveRequestModel,
    HomeworkModel,
    RoleModel,
    UserModel,
    parent_student,
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
  {
        "email": "aarav@myuser.com",
        "password": "aarav123",
        "name": "Aarav Kumar",
        "roles": ["student"],
        "grade": "Class 7A",
        "rollNo": "101",
    },
    {
        "email": "priya@myuser.com",
        "password": "priya123",
        "name": "Priya Kumar",
        "roles": ["student"],
        "grade": "Class 5B",
        "rollNo": "45",
    },
    {
        "email": "ravi@myuser.com",
        "password": "ravi123",
        "name": "Ravi Kumar",
        "roles": ["student"],
        "grade": "Class 9C",
        "rollNo": "22",
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
# Emails of children that belong to parent@myuser.com
PARENT_EMAIL = "parent@myuser.com"
CHILDREN_EMAILS = ["aarav@myuser.com", "priya@myuser.com", "ravi@myuser.com"]


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


async def link_parent_children(db: AsyncSession) -> None:
    """
    Create parent_student links for demo data.

    Args:
        db: Database session
    """
    parent_result = await db.execute(
        select(UserModel).where(UserModel.email == PARENT_EMAIL)
    )
    parent = parent_result.unique().scalar_one_or_none()
    if not parent:
        Logger.warning(
            f"Parent user '{PARENT_EMAIL}' not found; skipping links."
        )
        return

    children_result = await db.execute(
        select(UserModel).where(UserModel.email.in_(CHILDREN_EMAILS))
    )
    children = children_result.unique().scalars().all()
    if not children:
        Logger.warning("No demo children found; skipping parent links.")
        return

    for child in children:
        existing = await db.execute(
            select(parent_student).where(
                parent_student.c.parent_id == parent.id,
                parent_student.c.student_id == child.id,
            )
        )
        if existing.first():
            Logger.info(
                f"Parent link already exists: parent={parent.id}, child={child.id}"
            )
            continue

        await db.execute(
            insert(parent_student).values(
                parent_id=parent.id,
                student_id=child.id,
            )
        )
        Logger.info(
            f"Linked parent {parent.id} to child {child.id}"
        )

    await db.commit()


async def seed_attendance_and_leave(db: AsyncSession) -> None:
    """
    Seed demo attendance and leave requests for linked children.

    Args:
        db: Database session
    """
    children_result = await db.execute(
        select(UserModel).where(UserModel.email.in_(CHILDREN_EMAILS))
    )
    children = children_result.unique().scalars().all()
    if not children:
        Logger.warning("No demo children found; skipping attendance/leave seeding.")
        return

    today = datetime.utcnow().date()
    for child in children:
        existing_attendance = await db.execute(
            select(AttendanceModel).where(
                AttendanceModel.student_id == child.id,
            )
        )
        if not existing_attendance.first():
            for offset in range(7):
                day = today - timedelta(days=offset)
                status = "present" if offset % 4 != 0 else "absent"
                db.add(
                    AttendanceModel(
                        student_id=child.id,
                        date=datetime(day.year, day.month, day.day),
                        status=status,
                    )
                )

        existing_leave = await db.execute(
            select(LeaveRequestModel).where(
                LeaveRequestModel.student_id == child.id,
            )
        )
        if not existing_leave.first():
            start_date = datetime(today.year, today.month, max(today.day - 3, 1))
            end_date = start_date + timedelta(days=1)
            db.add(
                LeaveRequestModel(
                    student_id=child.id,
                    start_date=start_date,
                    end_date=end_date,
                    reason="Medical appointment",
                    status="approved",
                    applied_date=datetime.utcnow(),
                    teacher_note="Approved. Get well soon.",
                )
            )

    await db.commit()


async def seed_database() -> None:
    """
    Main function to seed the database.

    This function:
    1. Initializes database (creates tables)
    2. Creates roles
    3. Creates demo users
    4. Links demo parent to children
    5. Seeds attendance and leave
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

            # Link parent to children
            await link_parent_children(db)

            # Seed attendance and leave
            await seed_attendance_and_leave(db)

        Logger.info("Database seeding completed successfully!")

    except Exception as e:
        Logger.error(f"Error seeding database: {e}", exc_info=True)
        raise


if __name__ == "__main__":
    # Run seeding
    asyncio.run(seed_database())
