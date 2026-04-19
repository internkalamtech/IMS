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
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import Logger
from app.core.password import hash_password
from app.infrastructure.database.database import AsyncSessionLocal, init_db
from app.infrastructure.database.models import (
    DriverVehicleAssignmentModel,
    RoleModel,
    UserModel,
    VehicleComplianceDocumentModel,
    VehicleMaintenanceTaskModel,
    VehicleModel,
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

VEHICLES = [
    {
        "registration_number": "BUS-101",
        "display_name": "School Bus 101",
    }
]

VEHICLE_DOCUMENTS = [
    {
        "registration_number": "BUS-101",
        "title": "Driving License",
        "expiry_date": date(2026, 4, 10),
    },
    {
        "registration_number": "BUS-101",
        "title": "Bus Insurance",
        "expiry_date": date(2026, 3, 20),
    },
    {
        "registration_number": "BUS-101",
        "title": "Fitness Certificate",
        "expiry_date": date(2026, 2, 15),
    },
]

VEHICLE_MAINTENANCE_TASKS = [
    {
        "registration_number": "BUS-101",
        "title": "Brake Inspection",
        "scheduled_date": date(2026, 2, 28),
        "status": "Completed",
    },
    {
        "registration_number": "BUS-101",
        "title": "Tire Check",
        "scheduled_date": date(2026, 3, 15),
        "status": "In Progress",
    },
    {
        "registration_number": "BUS-101",
        "title": "Oil Change",
        "scheduled_date": date(2026, 3, 20),
        "status": "Scheduled",
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


async def create_vehicles(db: AsyncSession) -> dict[str, VehicleModel]:
    """Create demo vehicles if they do not exist."""

    Logger.info("Creating demo vehicles...")
    vehicles_map = {}

    for vehicle_data in VEHICLES:
        result = await db.execute(
            select(VehicleModel).where(
                VehicleModel.registration_number
                == vehicle_data["registration_number"]
            )
        )
        vehicle = result.scalar_one_or_none()

        if not vehicle:
            vehicle = VehicleModel(**vehicle_data)
            db.add(vehicle)
            Logger.info(
                "Created vehicle: "
                f"{vehicle_data['registration_number']}"
            )
        else:
            vehicle.display_name = vehicle_data["display_name"]
            Logger.info(
                "Vehicle already exists: "
                f"{vehicle_data['registration_number']}"
            )

        vehicles_map[vehicle_data["registration_number"]] = vehicle

    await db.commit()
    return vehicles_map


async def assign_driver_vehicle(
    db: AsyncSession, vehicles_map: dict[str, VehicleModel]
) -> None:
    """Assign the demo driver to the demo bus."""

    result = await db.execute(
        select(UserModel).where(UserModel.email == "driver@myuser.com")
    )
    driver = result.unique().scalar_one_or_none()
    vehicle = vehicles_map.get("BUS-101")

    if not driver or not vehicle:
        return

    result = await db.execute(
        select(DriverVehicleAssignmentModel).where(
            DriverVehicleAssignmentModel.user_id == driver.id
        )
    )
    assignment = result.scalar_one_or_none()

    if assignment:
        assignment.vehicle_id = vehicle.id
        Logger.info("Updated driver vehicle assignment to BUS-101")
    else:
        db.add(
            DriverVehicleAssignmentModel(
                user_id=driver.id,
                vehicle_id=vehicle.id,
            )
        )
        Logger.info("Assigned driver@myuser.com to BUS-101")

    await db.commit()


async def create_vehicle_documents(
    db: AsyncSession, vehicles_map: dict[str, VehicleModel]
) -> None:
    """Create demo compliance documents for the assigned vehicle."""

    Logger.info("Creating vehicle compliance documents...")

    for document_data in VEHICLE_DOCUMENTS:
        vehicle = vehicles_map[document_data["registration_number"]]
        result = await db.execute(
            select(VehicleComplianceDocumentModel).where(
                VehicleComplianceDocumentModel.vehicle_id == vehicle.id,
                VehicleComplianceDocumentModel.title
                == document_data["title"],
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            existing.expiry_date = document_data["expiry_date"]
            Logger.info(
                "Vehicle compliance document already exists: "
                f"{document_data['title']}"
            )
            continue

        db.add(
            VehicleComplianceDocumentModel(
                vehicle_id=vehicle.id,
                title=document_data["title"],
                expiry_date=document_data["expiry_date"],
            )
        )
        Logger.info(
            "Created vehicle compliance document: "
            f"{document_data['title']}"
        )

    await db.commit()


async def create_vehicle_maintenance_tasks(
    db: AsyncSession, vehicles_map: dict[str, VehicleModel]
) -> None:
    """Create demo maintenance tasks for the assigned vehicle."""

    Logger.info("Creating vehicle maintenance tasks...")

    for task_data in VEHICLE_MAINTENANCE_TASKS:
        vehicle = vehicles_map[task_data["registration_number"]]
        result = await db.execute(
            select(VehicleMaintenanceTaskModel).where(
                VehicleMaintenanceTaskModel.vehicle_id == vehicle.id,
                VehicleMaintenanceTaskModel.title == task_data["title"],
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            existing.scheduled_date = task_data["scheduled_date"]
            existing.status = task_data["status"]
            Logger.info(
                "Vehicle maintenance task already exists: "
                f"{task_data['title']}"
            )
            continue

        db.add(
            VehicleMaintenanceTaskModel(
                vehicle_id=vehicle.id,
                title=task_data["title"],
                scheduled_date=task_data["scheduled_date"],
                status=task_data["status"],
            )
        )
        Logger.info(
            "Created vehicle maintenance task: "
            f"{task_data['title']}"
        )

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

            # Create driver transport data
            vehicles_map = await create_vehicles(db)
            await assign_driver_vehicle(db, vehicles_map)
            await create_vehicle_documents(db, vehicles_map)
            await create_vehicle_maintenance_tasks(db, vehicles_map)

        Logger.info("Database seeding completed successfully!")

    except Exception as e:
        Logger.error(f"Error seeding database: {e}", exc_info=True)
        raise


if __name__ == "__main__":
    # Run seeding
    asyncio.run(seed_database())
