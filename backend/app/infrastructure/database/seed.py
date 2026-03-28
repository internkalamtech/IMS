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
            role = RoleModel(**{k: v for k, v in role_data.items()})
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

            # Create user (only pass model-compatible fields)
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


async def seed_parent_student_links(db: AsyncSession) -> None:
    """
    Link parent@myuser.com to all demo children so the attendance
    ownership checks pass and real DB data is returned.
    """
    Logger.info("Seeding parent-student links...")

    parent_result = await db.execute(
        select(UserModel).where(UserModel.email == PARENT_EMAIL)
    )
    parent = parent_result.unique().scalar_one_or_none()

    if not parent:
        Logger.warning(f"Could not find parent user '{PARENT_EMAIL}'")
        return

    for child_email in CHILDREN_EMAILS:
        child_result = await db.execute(
            select(UserModel).where(UserModel.email == child_email)
        )
        child = child_result.unique().scalar_one_or_none()

        if not child:
            Logger.warning(f"Could not find child user '{child_email}'")
            continue

        # Check if link already exists
        from sqlalchemy import select as sa_select
        existing = await db.execute(
            sa_select(parent_student).where(
                parent_student.c.parent_id == parent.id,
                parent_student.c.student_id == child.id,
            )
        )
        if not existing.first():
            await db.execute(
                parent_student.insert().values(
                    parent_id=parent.id, student_id=child.id
                )
            )
            Logger.info(f"Linked parent({parent.id}) → {child.name}({child.id})")
        else:
            Logger.info(f"Link already exists: parent → {child.name}")

    await db.commit()


async def seed_attendance_records(db: AsyncSession) -> None:
    """
    Seed realistic attendance records for demo children for the past
    2 months (current month + previous month) so the calendar and
    summary screens show real data instead of mock fallback.
    """
    Logger.info("Seeding attendance records...")

    # Patterns per child: (present_ratio, absent_days_of_month, leave_days)
    child_patterns = {
        "aarav@myuser.com": {"present_bias": 0.93, "absent_days": [10, 20], "leave_days": [14, 15]},
        "priya@myuser.com": {"present_bias": 0.82, "absent_days": [5, 10, 20, 25, 28, 30], "leave_days": []},
        "ravi@myuser.com": {"present_bias": 0.88, "absent_days": [7, 17, 27], "leave_days": [22]},
        "student@myuser.com": {"present_bias": 0.90, "absent_days": [12, 22], "leave_days": []},
    }

    now = datetime.utcnow()

    for child_email, pattern in child_patterns.items():
        child_result = await db.execute(
            select(UserModel).where(UserModel.email == child_email)
        )
        child = child_result.unique().scalar_one_or_none()

        if not child:
            continue

        # Seed for last 2 months
        for month_offset in [1, 0]:
            # Calculate target year/month
            target_month = now.month - month_offset
            target_year = now.year
            if target_month <= 0:
                target_month += 12
                target_year -= 1

            days_in_month = cal_lib.monthrange(target_year, target_month)[1]
            # Only go up to today for the current month
            max_day = now.day if (target_year == now.year and target_month == now.month) else days_in_month

            for day in range(1, max_day + 1):
                date = datetime(target_year, target_month, day)
                weekday = date.weekday()  # 0=Mon … 6=Sun

                # Determine status
                if weekday >= 5:  # Saturday/Sunday → holiday
                    status = "holiday"
                elif day in pattern["absent_days"]:
                    status = "absent"
                elif day in pattern["leave_days"]:
                    status = "leave"
                else:
                    status = "present"

                # Check if record already exists
                existing = await db.execute(
                    select(AttendanceModel).where(
                        AttendanceModel.student_id == child.id,
                        AttendanceModel.date == date,
                    )
                )
                if not existing.scalar_one_or_none():
                    db.add(AttendanceModel(
                        student_id=child.id,
                        date=date,
                        status=status,
                    ))

        Logger.info(f"Attendance seeded for {child.name}")

    await db.commit()


async def seed_leave_requests(db: AsyncSession) -> None:
    """
    Seed demo leave requests so that leave history appears in the calendar.
    """
    Logger.info("Seeding leave requests...")

    demo_leaves = [
        {
            "child_email": "aarav@myuser.com",
            "start": datetime(datetime.utcnow().year, datetime.utcnow().month, 14),
            "end": datetime(datetime.utcnow().year, datetime.utcnow().month, 15),
            "reason": "Medical appointment",
            "status": "Approved",
            "note": "Approved. Get well soon.",
        },
        {
            "child_email": "priya@myuser.com",
            "start": datetime(datetime.utcnow().year, datetime.utcnow().month, 5),
            "end": datetime(datetime.utcnow().year, datetime.utcnow().month, 5),
            "reason": "Family function",
            "status": "Approved",
            "note": "Noted.",
        },
        {
            "child_email": "ravi@myuser.com",
            "start": datetime(datetime.utcnow().year, datetime.utcnow().month, 22),
            "end": datetime(datetime.utcnow().year, datetime.utcnow().month, 22),
            "reason": "Fever",
            "status": "Pending",
            "note": None,
        },
    ]

    for leave_data in demo_leaves:
        child_result = await db.execute(
            select(UserModel).where(UserModel.email == leave_data["child_email"])
        )
        child = child_result.unique().scalar_one_or_none()
        if not child:
            continue

        # Check if a leave for the same child+start_date already exists
        existing = await db.execute(
            select(LeaveRequestModel).where(
                LeaveRequestModel.student_id == child.id,
                LeaveRequestModel.start_date == leave_data["start"],
            )
        )
        if not existing.scalar_one_or_none():
            db.add(LeaveRequestModel(
                student_id=child.id,
                start_date=leave_data["start"],
                end_date=leave_data["end"],
                reason=leave_data["reason"],
                status=leave_data["status"],
                teacher_note=leave_data["note"],
                applied_date=leave_data["start"] - timedelta(days=4),
            ))
            Logger.info(f"Leave seeded for {child.name}: {leave_data['reason']}")
        else:
            Logger.info(f"Leave already exists for {child.name}")

    await db.commit()


async def seed_database() -> None:
    """
    Main function to seed the database.

    This function:
    1. Initializes database (creates tables)
    2. Creates roles
    3. Creates demo users (including named student children)
    4. Links parent → children in parent_student table
    5. Seeds attendance records for the last 2 months
    6. Seeds demo leave requests
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

            # Seed parent-student links
            await seed_parent_student_links(db)

            # Seed attendance records
            await seed_attendance_records(db)

            # Seed leave requests
            await seed_leave_requests(db)

        Logger.info("Database seeding completed successfully!")

    except Exception as e:
        Logger.error(f"Error seeding database: {e}", exc_info=True)
        raise


if __name__ == "__main__":
    # Run seeding
    asyncio.run(seed_database())
