"""
Database seeding script for demo data.
"""

import asyncio
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import Logger
from app.core.password import hash_password
from app.infrastructure.database.database import AsyncSessionLocal, init_db
from app.infrastructure.database.models import (
    RoleModel,
    UserModel,
    TimetableModel,
)


# -------------------------
# DEMO USERS
# -------------------------
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
]


# -------------------------
# ROLES
# -------------------------
ROLES = [
    {"name": "admin", "description": "Administrator"},
    {"name": "teacher", "description": "Teacher"},
    {"name": "parent", "description": "Parent"},
    {"name": "student", "description": "Student"},
]


# -------------------------
# CREATE ROLES
# -------------------------
async def create_roles(db: AsyncSession) -> dict[str, RoleModel]:
    roles_map = {}

    for role_data in ROLES:
        result = await db.execute(
            select(RoleModel).where(RoleModel.name == role_data["name"])
        )
        role = result.scalar_one_or_none()

        if not role:
            role = RoleModel(**role_data)
            db.add(role)

        roles_map[role_data["name"]] = role

    await db.commit()
    return roles_map


# -------------------------
# CREATE USERS
# -------------------------
async def create_users(
    db: AsyncSession,
    roles_map: dict[str, RoleModel],
) -> None:
    for user_data in DEMO_USERS:
        result = await db.execute(
            select(UserModel).where(UserModel.email == user_data["email"])
        )
        user = result.scalar_one_or_none()

        if not user:
            user = UserModel(
                email=user_data["email"],
                password_hash=hash_password(user_data["password"]),
                name=user_data["name"],
                is_active=True,
            )

            for role_name in user_data["roles"]:
                role = roles_map.get(role_name)
                if role:
                    user.roles.append(role)

            db.add(user)

    await db.commit()


# -------------------------
# CREATE TIMETABLE (SAFE)
# -------------------------
async def create_timetable(db: AsyncSession):
    result = await db.execute(
        select(UserModel).where(
            UserModel.email == "teacher@myuser.com"
        )
    )
    teacher = result.scalar_one_or_none()

    if not teacher:
        Logger.error("Teacher user not found, skipping timetable seed")
        return

    # refresh to ensure ID is available
    await db.refresh(teacher)

    existing = await db.execute(select(TimetableModel))
    if existing.first():
        Logger.info("Timetable already exists, skipping insert")
        return

    timetable_rows = [
        TimetableModel(
            teacher_id=teacher.id,
            subject="Math",
            room_type="101",
            start_time=datetime(2026, 3, 19, 9, 0),
            end_time=datetime(2026, 3, 19, 10, 0),
        ),
        TimetableModel(
            teacher_id=teacher.id,
            subject="English",
            room_type="102",
            start_time=datetime(2026, 3, 19, 10, 0),
            end_time=datetime(2026, 3, 19, 11, 0),
        ),
    ]

    db.add_all(timetable_rows)
    await db.commit()
    Logger.info("Timetable seeded successfully")


# -------------------------
# MAIN SEED FUNCTION
# -------------------------
async def seed_database():
    try:
        Logger.info("Starting DB seed...")

        await init_db()

        async with AsyncSessionLocal() as db:
            roles_map = await create_roles(db)
            await create_users(db, roles_map)
            await create_timetable(db)

        Logger.info("Seeding completed successfully")

    except Exception as e:
        Logger.error(
            f"Seeding failed: {e}",
            exc_info=True
        )
        raise


# -------------------------
# RUN
# -------------------------
if __name__ == "__main__":
    asyncio.run(seed_database())
