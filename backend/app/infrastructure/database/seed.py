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
    ClassSectionModel,
    RoleModel,
    RoomModel,
    SubjectModel,
    TeacherModel,
    TimetablePeriodModel,
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

# Subjects configuration
SUBJECTS = [
    {"name": "Mathematics"},
    {"name": "English"},
    {"name": "Science"},
    {"name": "Social Studies"},
    {"name": "Hindi"},
    {"name": "Computer Science"},
    {"name": "Physical Education"},
    {"name": "Art"},
]

# Class sections configuration
CLASS_SECTIONS = [
    {"name": "Class 1-A"},
    {"name": "Class 1-B"},
    {"name": "Class 2-A"},
    {"name": "Class 2-B"},
    {"name": "Class 3-A"},
    {"name": "Class 3-B"},
    {"name": "Class 4-A"},
    {"name": "Class 4-B"},
    {"name": "Class 5-A"},
    {"name": "Class 5-B"},
    {"name": "Class 6-A"},
    {"name": "Class 6-B"},
    {"name": "Class 7-A"},
    {"name": "Class 7-B"},
    {"name": "Class 8-A"},
    {"name": "Class 8-B"},
    {"name": "Class 9-A"},
    {"name": "Class 9-B"},
    {"name": "Class 10-A"},
    {"name": "Class 10-B"},
]

# Rooms configuration
ROOMS = [
    {"name": "Room 101", "room_type": "classroom", "capacity": 30},
    {"name": "Room 102", "room_type": "classroom", "capacity": 30},
    {"name": "Room 103", "room_type": "classroom", "capacity": 30},
    {"name": "Room 104", "room_type": "classroom", "capacity": 30},
    {"name": "Lab 201", "room_type": "lab", "capacity": 25},
    {"name": "Lab 202", "room_type": "lab", "capacity": 25},
    {"name": "Gym", "room_type": "gym", "capacity": 50},
    {"name": "Art Room", "room_type": "classroom", "capacity": 20},
]

# Demo teachers configuration
DEMO_TEACHERS = [
    {
        "email": "math_teacher@school.com",
        "password": "teacher123",
        "name": "Mr. Sharma",
        "employee_id": "T001",
        "specialization": "Mathematics",
    },
    {
        "email": "english_teacher@school.com",
        "password": "teacher123",
        "name": "Ms. Patel",
        "employee_id": "T002",
        "specialization": "English",
    },
    {
        "email": "science_teacher@school.com",
        "password": "teacher123",
        "name": "Mr. Kumar",
        "employee_id": "T003",
        "specialization": "Science",
    },
    {
        "email": "social_studies_teacher@school.com",
        "password": "teacher123",
        "name": "Ms. Singh",
        "employee_id": "T004",
        "specialization": "Social Studies",
    },
    {
        "email": "hindi_teacher@school.com",
        "password": "teacher123",
        "name": "Mr. Gupta",
        "employee_id": "T005",
        "specialization": "Hindi",
    },
    {
        "email": "computer_teacher@school.com",
        "password": "teacher123",
        "name": "Ms. Reddy",
        "employee_id": "T006",
        "specialization": "Computer Science",
    },
    {
        "email": "pe_teacher@school.com",
        "password": "teacher123",
        "name": "Mr. Joshi",
        "employee_id": "T007",
        "specialization": "Physical Education",
    },
    {
        "email": "art_teacher@school.com",
        "password": "teacher123",
        "name": "Ms. Mehta",
        "employee_id": "T008",
        "specialization": "Art",
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


async def create_subjects(db: AsyncSession) -> dict[str, SubjectModel]:
    """
    Create subjects if they don't exist.

    Args:
        db: Database session

    Returns:
        Dictionary mapping subject names to SubjectModel instances
    """
    Logger.info("Creating subjects...")
    subjects_map = {}

    for subject_data in SUBJECTS:
        # Check if subject exists
        result = await db.execute(
            select(SubjectModel).where(
                SubjectModel.name == subject_data["name"]
            )
        )
        subject = result.scalar_one_or_none()

        if not subject:
            # Create new subject
            subject = SubjectModel(**subject_data)
            db.add(subject)
            Logger.info(f"Created subject: {subject_data['name']}")
        else:
            Logger.info(f"Subject already exists: {subject_data['name']}")

        subjects_map[subject_data["name"]] = subject

    await db.commit()
    return subjects_map


async def create_class_sections(
    db: AsyncSession
) -> dict[str, ClassSectionModel]:
    """
    Create class sections if they don't exist.

    Args:
        db: Database session

    Returns:
        Dictionary mapping class names to ClassSectionModel instances
    """
    Logger.info("Creating class sections...")
    classes_map = {}

    for class_data in CLASS_SECTIONS:
        # Check if class exists
        result = await db.execute(
            select(ClassSectionModel).where(
                ClassSectionModel.name == class_data["name"]
            )
        )
        class_section = result.scalar_one_or_none()

        if not class_section:
            # Create new class
            class_section = ClassSectionModel(**class_data)
            db.add(class_section)
            Logger.info(f"Created class: {class_data['name']}")
        else:
            Logger.info(f"Class already exists: {class_data['name']}")

        classes_map[class_data["name"]] = class_section

    await db.commit()
    return classes_map


async def create_rooms(db: AsyncSession) -> dict[str, RoomModel]:
    """
    Create rooms if they don't exist.

    Args:
        db: Database session

    Returns:
        Dictionary mapping room names to RoomModel instances
    """
    Logger.info("Creating rooms...")
    rooms_map = {}

    for room_data in ROOMS:
        # Check if room exists
        result = await db.execute(
            select(RoomModel).where(RoomModel.name == room_data["name"])
        )
        room = result.scalar_one_or_none()

        if not room:
            # Create new room
            room = RoomModel(**room_data)
            db.add(room)
            Logger.info(f"Created room: {room_data['name']}")
        else:
            Logger.info(f"Room already exists: {room_data['name']}")

        rooms_map[room_data["name"]] = room

    await db.commit()
    return rooms_map


async def create_teachers(
    db: AsyncSession, roles_map: dict[str, RoleModel]
) -> dict[str, TeacherModel]:
    """
    Create demo teachers if they don't exist.

    Args:
        db: Database session
        roles_map: Dictionary mapping role names to RoleModel instances

    Returns:
        Dictionary mapping teacher names to TeacherModel instances
    """
    Logger.info("Creating demo teachers...")
    teachers_map = {}

    for teacher_data in DEMO_TEACHERS:
        # Check if user exists
        result = await db.execute(
            select(UserModel).where(UserModel.email == teacher_data["email"])
        )
        user = result.unique().scalar_one_or_none()

        if not user:
            # Hash password
            password_hash = hash_password(teacher_data["password"])

            # Create user
            user = UserModel(
                email=teacher_data["email"],
                password_hash=password_hash,
                name=teacher_data["name"],
                is_active=True,
            )

            # Assign teacher role
            if "teacher" in roles_map:
                user.roles.append(roles_map["teacher"])

            db.add(user)
            await db.flush()  # Get user ID

        # Check if teacher profile exists
        result = await db.execute(
            select(TeacherModel).where(TeacherModel.user_id == user.id)
        )
        teacher = result.scalar_one_or_none()

        if not teacher:
            # Create teacher profile
            teacher = TeacherModel(
                user_id=user.id,
                employee_id=teacher_data["employee_id"],
                specialization=teacher_data["specialization"],
            )
            db.add(teacher)
            Logger.info(f"Created teacher: {teacher_data['name']}")
        else:
            Logger.info(f"Teacher already exists: {teacher_data['name']}")

        teachers_map[teacher_data["name"]] = teacher

    await db.commit()
    return teachers_map


async def create_sample_timetable(
    db: AsyncSession,
    classes_map: dict[str, ClassSectionModel],
    subjects_map: dict[str, SubjectModel],
    teachers_map: dict[str, TeacherModel],
    rooms_map: dict[str, RoomModel],
) -> None:
    """
    Create sample timetable data for Class 7-B.

    Args:
        db: Database session
        classes_map: Dictionary mapping class names to ClassSectionModel
            instances
        subjects_map: Dictionary mapping subject names to SubjectModel
            instances
        teachers_map: Dictionary mapping teacher names to TeacherModel
            instances
        rooms_map: Dictionary mapping room names to RoomModel instances
    """
    Logger.info("Creating sample timetable...")

    # Sample timetable for Class 7-B (Monday to Friday)
    timetable_data = [
        # Monday
        {
            "day": 0,
            "period": 1,
            "subject": "Mathematics",
            "teacher": "Mr. Sharma",
            "room": "Room 101",
            "start": "09:00",
            "end": "10:00"
        },
        {
            "day": 0,
            "period": 2,
            "subject": "English",
            "teacher": "Ms. Patel",
            "room": "Room 102",
            "start": "10:00",
            "end": "11:00"
        },
        {
            "day": 0,
            "period": 3,
            "subject": "Science",
            "teacher": "Mr. Kumar",
            "room": "Lab 201",
            "start": "11:00",
            "end": "12:00"
        },
        {
            "day": 0,
            "period": 4,
            "subject": "BREAK",
            "teacher": "Ms. Patel",
            "room": "Room 102",
            "start": "12:00",
            "end": "12:30"
        },  # Break
        {
            "day": 0,
            "period": 5,
            "subject": "Social Studies",
            "teacher": "Ms. Singh",
            "room": "Room 103",
            "start": "12:30",
            "end": "13:30"
        },
        {
            "day": 0,
            "period": 6,
            "subject": "Hindi",
            "teacher": "Mr. Gupta",
            "room": "Room 104",
            "start": "13:30",
            "end": "14:30"
        },
        {
            "day": 0,
            "period": 7,
            "subject": "Computer Science",
            "teacher": "Ms. Reddy",
            "room": "Lab 202",
            "start": "14:30",
            "end": "15:30"
        },

        # Tuesday
        {
            "day": 1,
            "period": 1,
            "subject": "English",
            "teacher": "Ms. Patel",
            "room": "Room 102",
            "start": "09:00",
            "end": "10:00"
        },
        {
            "day": 1,
            "period": 2,
            "subject": "Mathematics",
            "teacher": "Mr. Sharma",
            "room": "Room 101",
            "start": "10:00",
            "end": "11:00"
        },
        {
            "day": 1,
            "period": 3,
            "subject": "Hindi",
            "teacher": "Mr. Gupta",
            "room": "Room 104",
            "start": "11:00",
            "end": "12:00"
        },
        {
            "day": 1,
            "period": 4,
            "subject": "BREAK",
            "teacher": "Ms. Patel",
            "room": "Room 102",
            "start": "12:00",
            "end": "12:30"
        },  # Break
        {
            "day": 1,
            "period": 5,
            "subject": "Science",
            "teacher": "Mr. Kumar",
            "room": "Lab 201",
            "start": "12:30",
            "end": "13:30"
        },
        {
            "day": 1,
            "period": 6,
            "subject": "Social Studies",
            "teacher": "Ms. Singh",
            "room": "Room 103",
            "start": "13:30",
            "end": "14:30"
        },
        {
            "day": 1,
            "period": 7,
            "subject": "Physical Education",
            "teacher": "Mr. Joshi",
            "room": "Gym",
            "start": "14:30",
            "end": "15:30"
        },

        # Wednesday
        {
            "day": 2,
            "period": 1,
            "subject": "Science",
            "teacher": "Mr. Kumar",
            "room": "Lab 201",
            "start": "09:00",
            "end": "10:00"
        },
        {
            "day": 2,
            "period": 2,
            "subject": "Social Studies",
            "teacher": "Ms. Singh",
            "room": "Room 103",
            "start": "10:00",
            "end": "11:00"
        },
        {
            "day": 2,
            "period": 3,
            "subject": "Mathematics",
            "teacher": "Mr. Sharma",
            "room": "Room 101",
            "start": "11:00",
            "end": "12:00"
        },
        {
            "day": 2,
            "period": 4,
            "subject": "BREAK",
            "teacher": "Ms. Patel",
            "room": "Room 102",
            "start": "12:00",
            "end": "12:30"
        },  # Break
        {
            "day": 2,
            "period": 5,
            "subject": "English",
            "teacher": "Ms. Patel",
            "room": "Room 102",
            "start": "12:30",
            "end": "13:30"
        },
        {
            "day": 2,
            "period": 6,
            "subject": "Computer Science",
            "teacher": "Ms. Reddy",
            "room": "Lab 202",
            "start": "13:30",
            "end": "14:30"
        },
        {
            "day": 2,
            "period": 7,
            "subject": "Art",
            "teacher": "Ms. Mehta",
            "room": "Art Room",
            "start": "14:30",
            "end": "15:30"
        },

        # Thursday
        {
            "day": 3,
            "period": 1,
            "subject": "Social Studies",
            "teacher": "Ms. Singh",
            "room": "Room 103",
            "start": "09:00",
            "end": "10:00"
        },
        {
            "day": 3,
            "period": 2,
            "subject": "Hindi",
            "teacher": "Mr. Gupta",
            "room": "Room 104",
            "start": "10:00",
            "end": "11:00"
        },
        {
            "day": 3,
            "period": 3,
            "subject": "English",
            "teacher": "Ms. Patel",
            "room": "Room 102",
            "start": "11:00",
            "end": "12:00"
        },
        {
            "day": 3,
            "period": 4,
            "subject": "BREAK",
            "teacher": "Ms. Patel",
            "room": "Room 102",
            "start": "12:00",
            "end": "12:30"
        },  # Break
        {
            "day": 3,
            "period": 5,
            "subject": "Mathematics",
            "teacher": "Mr. Sharma",
            "room": "Room 101",
            "start": "12:30",
            "end": "13:30"
        },
        {
            "day": 3,
            "period": 6,
            "subject": "Science",
            "teacher": "Mr. Kumar",
            "room": "Lab 201",
            "start": "13:30",
            "end": "14:30"
        },
        {
            "day": 3,
            "period": 7,
            "subject": "Physical Education",
            "teacher": "Mr. Joshi",
            "room": "Gym",
            "start": "14:30",
            "end": "15:30"
        },

        # Friday
        {
            "day": 4,
            "period": 1,
            "subject": "Hindi",
            "teacher": "Mr. Gupta",
            "room": "Room 104",
            "start": "09:00",
            "end": "10:00"
        },
        {
            "day": 4,
            "period": 2,
            "subject": "Computer Science",
            "teacher": "Ms. Reddy",
            "room": "Lab 202",
            "start": "10:00",
            "end": "11:00"
        },
        {
            "day": 4,
            "period": 3,
            "subject": "Social Studies",
            "teacher": "Ms. Singh",
            "room": "Room 103",
            "start": "11:00",
            "end": "12:00"
        },
        {
            "day": 4,
            "period": 4,
            "subject": "BREAK",
            "teacher": "Ms. Patel",
            "room": "Room 102",
            "start": "12:00",
            "end": "12:30"
        },  # Break
        {
            "day": 4,
            "period": 5,
            "subject": "English",
            "teacher": "Ms. Patel",
            "room": "Room 102",
            "start": "12:30",
            "end": "13:30"
        },
        {
            "day": 4,
            "period": 6,
            "subject": "Mathematics",
            "teacher": "Mr. Sharma",
            "room": "Room 101",
            "start": "13:30",
            "end": "14:30"
        },
        {
            "day": 4,
            "period": 7,
            "subject": "Art",
            "teacher": "Ms. Mehta",
            "room": "Art Room",
            "start": "14:30",
            "end": "15:30"
        },
    ]

    class_7b = classes_map.get("Class 7-B")
    if not class_7b:
        Logger.warning("Class 7-B not found, skipping timetable creation")
        return

    for period_data in timetable_data:
        # Check if period already exists
        result = await db.execute(
            select(TimetablePeriodModel).where(
                TimetablePeriodModel.class_id == class_7b.id,
                TimetablePeriodModel.day_of_week == period_data["day"],
                TimetablePeriodModel.period_number == period_data["period"]
            )
        )
        existing_period = result.scalar_one_or_none()

        if existing_period:
            continue

        # Get related entities
        subject = subjects_map.get(period_data["subject"])
        teacher = teachers_map.get(period_data["teacher"])
        room = rooms_map.get(period_data["room"])

        if not subject or not teacher or not room:
            Logger.warning(f"Missing entity for period: {period_data}")
            continue

        # Create timetable period
        period = TimetablePeriodModel(
            class_id=class_7b.id,
            subject_id=subject.id,
            teacher_id=teacher.id,
            room_id=room.id,
            day_of_week=period_data["day"],
            start_time=period_data["start"],
            end_time=period_data["end"],
            period_number=period_data["period"],
        )

        db.add(period)
        Logger.info(
            f"Created timetable period: Day {period_data['day']}, "
            f"Period {period_data['period']}"
        )

    await db.commit()


async def seed_database() -> None:
    """
    Main function to seed the database.

    This function:
    1. Initializes database (creates tables)
    2. Creates roles
    3. Creates demo users
    4. Creates subjects, classes, rooms, teachers
    5. Creates sample timetable
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

            # Create subjects
            subjects_map = await create_subjects(db)

            # Create class sections
            classes_map = await create_class_sections(db)

            # Create rooms
            rooms_map = await create_rooms(db)

            # Create teachers
            teachers_map = await create_teachers(db, roles_map)

            # Create sample timetable
            await create_sample_timetable(
                db, classes_map, subjects_map, teachers_map, rooms_map
            )

        Logger.info("Database seeding completed successfully!")

    except Exception as e:
        Logger.error(f"Error seeding database: {e}", exc_info=True)
        raise


if __name__ == "__main__":
    # Run seeding
    asyncio.run(seed_database())
