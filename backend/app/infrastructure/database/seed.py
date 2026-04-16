"""
Database seeding script for demo data.

This script creates initial roles, demo users, exams, subjects, and students
for development and testing.

Following best practices:
- Idempotent operations (can run multiple times safely)
- Proper error handling
- Logging for visibility
- Transaction management
"""

import asyncio
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import Logger
from app.core.password import hash_password
from app.infrastructure.database.database import AsyncSessionLocal, init_db
from app.infrastructure.database.models import RoleModel, UserModel
from app.infrastructure.database.models import ExamModel, SubjectModel, StudentModel


# Demo users configuration
DEMO_USERS = [
    {"email": "admin@myuser.com", "password": "admin123", "name": "Admin User", "roles": ["admin"]},
    {"email": "teacher@myuser.com", "password": "teacher123", "name": "Teacher User", "roles": ["teacher"]},
    {"email": "parent@myuser.com", "password": "parent123", "name": "Parent User", "roles": ["parent"]},
    {"email": "student@myuser.com", "password": "student123", "name": "Student User", "roles": ["student"]},
    {"email": "transport@myuser.com", "password": "transport123", "name": "Transport Manager", "roles": ["transport"]},
    {"email": "driver@myuser.com", "password": "driver123", "name": "Driver User", "roles": ["driver"]},
    {"email": "john@myuser.com", "password": "john123", "name": "John Smith", "roles": ["parent", "teacher"]},
    {"email": "maria@myuser.com", "password": "maria123", "name": "Maria Garcia", "roles": ["parent", "teacher"]},
]

# Roles configuration
ROLES = [
    {"name": "admin", "description": "Administrator with full system access"},
    {"name": "teacher", "description": "Teacher with access to classes and students"},
    {"name": "parent", "description": "Parent with access to their children's information"},
    {"name": "student", "description": "Student with access to their own information"},
    {"name": "transport", "description": "Transport manager with access to routes and vehicles"},
    {"name": "driver", "description": "Driver with access to assigned routes"},
]

# Demo exams
DEMO_EXAMS = [
    {"id": 1, "name": "Midterm Exam", "date": "2024-03-01"},
    {"id": 2, "name": "Final Exam", "date": "2024-06-01"},
]

# Demo subjects
DEMO_SUBJECTS = [
    {"id": 101, "name": "Mathematics", "max_marks": 100, "exam_id": 1},
    {"id": 102, "name": "Science", "max_marks": 100, "exam_id": 1},
    {"id": 103, "name": "Physics", "max_marks": 100, "exam_id": 2},
]

# Demo students
DEMO_STUDENTS = [
    {"id": 201, "name": "Ali Khan", "roll_number": "10A-01", "subject_id": 101},
    {"id": 202, "name": "Sara Patel", "roll_number": "10A-02", "subject_id": 101},
    {"id": 203, "name": "Ravi Sharma", "roll_number": "10A-03", "subject_id": 102},
]


async def create_roles(db: AsyncSession) -> dict[str, RoleModel]:
    Logger.info("Creating roles...")
    roles_map = {}
    for role_data in ROLES:
        result = await db.execute(select(RoleModel).where(RoleModel.name == role_data["name"]))
        role = result.scalar_one_or_none()
        if not role:
            role = RoleModel(**role_data)
            db.add(role)
            Logger.info(f"Created role: {role_data['name']}")
        else:
            Logger.info(f"Role already exists: {role_data['name']}")
        roles_map[role_data["name"]] = role
    await db.commit()
    return roles_map


async def create_users(db: AsyncSession, roles_map: dict[str, RoleModel]) -> None:
    Logger.info("Creating demo users...")
    for user_data in DEMO_USERS:
        result = await db.execute(select(UserModel).where(UserModel.email == user_data["email"]))
        user = result.unique().scalar_one_or_none()
        if not user:
            password_hash = hash_password(user_data["password"])
            user = UserModel(
                email=user_data["email"],
                password_hash=password_hash,
                name=user_data["name"],
                is_active=True,
            )
            for role_name in user_data["roles"]:
                if role_name in roles_map:
                    user.roles.append(roles_map[role_name])
            db.add(user)
            Logger.info(f"Created user: {user_data['email']} with roles: {', '.join(user_data['roles'])}")
        else:
            Logger.info(f"User already exists: {user_data['email']}")
    await db.commit()


async def create_exams(db: AsyncSession) -> None:
    Logger.info("Creating demo exams...")
    for exam in DEMO_EXAMS:
        result = await db.execute(select(ExamModel).where(ExamModel.id == exam["id"]))
        existing = result.scalar_one_or_none()
        if not existing:
            db.add(
                ExamModel(
                    id=exam["id"],
                    name=exam["name"],
                    date=datetime.fromisoformat(exam["date"])
                )
            )
            Logger.info(f"Created exam: {exam['name']}")
        else:
            Logger.info(f"Exam already exists: {exam['name']}")
    await db.commit()


async def create_subjects_and_students(db: AsyncSession) -> None:
    Logger.info("Creating demo subjects and students...")
    for subj in DEMO_SUBJECTS:
        result = await db.execute(select(SubjectModel).where(SubjectModel.id == subj["id"]))
        existing = result.scalar_one_or_none()
        if not existing:
            db.add(SubjectModel(**subj))
            Logger.info(f"Created subject: {subj['name']}")
        else:
            Logger.info(f"Subject already exists: {subj['name']}")

    for stud in DEMO_STUDENTS:
        result = await db.execute(select(StudentModel).where(StudentModel.id == stud["id"]))
        existing = result.scalar_one_or_none()
        if not existing:
            db.add(StudentModel(**stud))
            Logger.info(f"Created student: {stud['name']}")
        else:
            Logger.info(f"Student already exists: {stud['name']}")

    await db.commit()


async def seed_database() -> None:
    try:
        Logger.info("Starting database seeding...")
        await init_db()
        Logger.info("Database tables created")

        async with AsyncSessionLocal() as db:
            roles_map = await create_roles(db)
            await create_users(db, roles_map)
            await create_exams(db)                  # ✅ exams first
            await create_subjects_and_students(db)  # ✅ then subjects & students

        Logger.info("Database seeding completed successfully!")
    except Exception as e:
        Logger.error(f"Error seeding database: {e}", exc_info=True)
        raise


if __name__ == "__main__":
    asyncio.run(seed_database())
