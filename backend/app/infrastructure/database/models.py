"""
SQLAlchemy database models for the IMS application.

These models represent the database schema using SQLAlchemy ORM.

Best practices followed:
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
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Base class for all database models."""
    pass


# Association table for many-to-many relationship between users and roles
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

    Represents a user with authentication credentials
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
            f"<User(id={self.id}, "
            f"email='{self.email}', "
            f"name='{self.name}')>"
        )


class RoleModel(Base):
    """
    Role database model.

    Represents roles like admin, teacher, student, etc.
    """

    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    name: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
        )

    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships
    users: Mapped[List["UserModel"]] = relationship(
        "UserModel",
        secondary=user_roles,
        back_populates="roles",
    )

    def __repr__(self) -> str:
        return f"<Role(id={self.id}, name='{self.name}')>"


class SubjectModel(Base):
    """
    Subject database model.

    Represents subjects like Math, Science, English, etc.
    """

    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    classes: Mapped[List["ClassSectionModel"]] = relationship(
        "ClassSectionModel",
        secondary="class_subject_link",
        back_populates="subjects",
    )


class ClassSectionModel(Base):
    """
    Class section database model.

    Represents classes like Grade 1, Grade 2, etc.
    """

    __tablename__ = "class_sections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    subjects: Mapped[List["SubjectModel"]] = relationship(
        "SubjectModel",
        secondary="class_subject_link",
        back_populates="classes",
    )


# Association table for many-to-many relationship between
# ClassSection and Subject
class_subject_link = Table(
    "class_subject_link",
    Base.metadata,
    Column(
        "class_id",
        Integer,
        ForeignKey("class_sections.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "subject_id",
        Integer,
        ForeignKey("subjects.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class StudentModel(Base):
    """
    Student database model.

    Represents a student in the transport system and for fee management.
    Links to User model for authentication.
    Includes fee status and next payment due date.
    """

    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    class_name: Mapped[str] = mapped_column(String(100), nullable=False)
    roll_number: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    parent_contact: Mapped[str | None] = mapped_column(String(255), nullable=True)
    next_due_date: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True
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
    user: Mapped["UserModel"] = relationship("UserModel", backref="student_profile")
    allocations: Mapped[List["StudentRouteAllocationModel"]] = relationship(
        "StudentRouteAllocationModel", back_populates="student", cascade="all, delete-orphan"
    )
    fee_structures: Mapped[List["FeeStructureModel"]] = relationship(
        "FeeStructureModel", back_populates="student", cascade="all, delete-orphan"
    )
    payments: Mapped[List["PaymentModel"]] = relationship(
        "PaymentModel", back_populates="student", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Student(id={self.id}, name='{self.name}', roll='{self.roll_number}')>"


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


class FeeStructureModel(Base):
    """
    Fee structure database model.

    Represents the fee details for a student, including total fee,
    amount paid, and outstanding balance.
    """

    __tablename__ = "fee_structures"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    total_fee: Mapped[float] = mapped_column(Float, nullable=False)
    amount_paid: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    fee_type: Mapped[str] = mapped_column(
        String(100), nullable=False, default="Tuition"
    )
    academic_year: Mapped[str] = mapped_column(
        String(20), nullable=False, default="2024-25"
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
    student: Mapped["StudentModel"] = relationship(
        "StudentModel", back_populates="fee_structures"
    )
    payments: Mapped[List["PaymentModel"]] = relationship(
        "PaymentModel",
        back_populates="fee_structure",
        cascade="all, delete-orphan",
    )

    @property
    def balance(self) -> float:
        """Outstanding balance."""
        return self.total_fee - self.amount_paid

    def __repr__(self) -> str:
        return (
            f"<FeeStructure(id={self.id}, "
            f"student_id={self.student_id}, "
            f"total={self.total_fee})>"
        )


class PaymentModel(Base):
    """
    Payment database model.

    Represents an individual payment transaction recorded for a student.
    """

    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    fee_structure_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("fee_structures.id", ondelete="CASCADE"),
        nullable=False,
    )
    receipt_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    payment_mode: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # Cash, UPI, Card
    reference_number: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="Paid"
    )  # Paid, Partial, Pending, Failed, Overdue
    remarks: Mapped[str | None] = mapped_column(String(500), nullable=True)
    payment_date: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
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
    student: Mapped["StudentModel"] = relationship(
        "StudentModel", back_populates="payments"
    )
    fee_structure: Mapped["FeeStructureModel"] = relationship(
        "FeeStructureModel", back_populates="payments"
    )

    def __repr__(self) -> str:
        return (
            f"<Payment(id={self.id}, "
            f"receipt='{self.receipt_number}', "
            f"amount={self.amount}, "
            f"status='{self.status}')>"
        )
