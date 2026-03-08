"""
SQLAlchemy database models for the IMS application.

These models represent the database schema using SQLAlchemy ORM.
Following best practices:
- Declarative base for model definition
- Proper relationships and foreign keys
- Timestamps for audit trail
- Indexes for performance
"""

from datetime import datetime
from typing import List

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Table,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Base class for all database models."""
    pass


# Association table for many-to-many relationship
# between users and roles
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column(
        "user_id",
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "role_id",
        Integer,
        ForeignKey("roles.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class UserModel(Base):
    """
    User database model.

    Represents a user in the system with authentication credentials
    and associated roles.
    """

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    roles: Mapped[List["RoleModel"]] = relationship(
        "RoleModel",
        secondary=user_roles,
        back_populates="users",
        lazy="joined",
    )

    def __repr__(self) -> str:
        return (
            f"<User(id={self.id}, email='{self.email}', name='{self.name}')>"
        )


class RoleModel(Base):
    """
    Role database model.

    Represents a role that can be assigned to users.
    Examples: admin, teacher, student, parent, transport, driver
    """

    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships
    users: Mapped[List["UserModel"]] = relationship(
        "UserModel", secondary=user_roles, back_populates="roles"
    )

    def __repr__(self) -> str:
        return f"<Role(id={self.id}, name='{self.name}')>"


class StudentModel(Base):
    """
    Student database model.

    Represents a student in the transport system.
    Links to User model for authentication.
    """

    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    class_name: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    roll_number: Mapped[str] = mapped_column(String(20), nullable=False)
    parent_contact: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    user: Mapped["UserModel"] = relationship("UserModel", backref="student_profile")
    allocations: Mapped[List["StudentRouteAllocationModel"]] = relationship(
        "StudentRouteAllocationModel", back_populates="student", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Student(id={self.id}, user_id={self.user_id}, class_name='{self.class_name}')>"


class VehicleModel(Base):
    """
    Vehicle database model.

    Represents a vehicle used for transport.
    """

    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    registration_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    driver_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    driver: Mapped["UserModel"] = relationship("UserModel", backref="driven_vehicle")
    routes: Mapped[List["RouteModel"]] = relationship(
        "RouteModel", back_populates="vehicle"
    )

    def __repr__(self) -> str:
        return f"<Vehicle(id={self.id}, registration='{self.registration_number}', capacity={self.capacity})>"


class RouteModel(Base):
    """
    Route database model.

    Represents a transport route.
    """

    __tablename__ = "routes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    vehicle_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    vehicle: Mapped["VehicleModel"] = relationship("VehicleModel", back_populates="routes")
    stops: Mapped[List["StopModel"]] = relationship(
        "StopModel", back_populates="route", cascade="all, delete-orphan"
    )
    allocations: Mapped[List["StudentRouteAllocationModel"]] = relationship(
        "StudentRouteAllocationModel", back_populates="route"
    )

    def __repr__(self) -> str:
        return f"<Route(id={self.id}, name='{self.name}')>"


class StopModel(Base):
    """
    Stop database model.

    Represents a pickup/drop-off stop in a route.
    """

    __tablename__ = "stops"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    route_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("routes.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    latitude: Mapped[float] = mapped_column(nullable=False)
    longitude: Mapped[float] = mapped_column(nullable=False)
    pickup_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    dropoff_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    sequence_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    route: Mapped["RouteModel"] = relationship("RouteModel", back_populates="stops")
    allocations: Mapped[List["StudentRouteAllocationModel"]] = relationship(
        "StudentRouteAllocationModel", back_populates="stop"
    )

    def __repr__(self) -> str:
        return f"<Stop(id={self.id}, name='{self.name}', route_id={self.route_id})>"


class StudentRouteAllocationModel(Base):
    """
    Student route allocation database model.

    Represents the assignment of a student to a specific route stop.
    """

    __tablename__ = "student_route_allocations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    route_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("routes.id", ondelete="CASCADE"), nullable=False
    )
    stop_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("stops.id", ondelete="CASCADE"), nullable=False
    )
    allocation_type: Mapped[str] = mapped_column(
        String(20), default="both", nullable=False
    )  # 'pickup', 'dropoff', 'both'
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    student: Mapped["StudentModel"] = relationship("StudentModel", back_populates="allocations")
    route: Mapped["RouteModel"] = relationship("RouteModel", back_populates="allocations")
    stop: Mapped["StopModel"] = relationship("StopModel", back_populates="allocations")

    def __repr__(self) -> str:
        return f"<StudentRouteAllocation(id={self.id}, student_id={self.student_id}, route_id={self.route_id})>"