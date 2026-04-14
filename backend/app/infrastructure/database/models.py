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
from typing import List, Optional

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

    Represents a student enrolled in the school, including their fee
    status and next payment due date.
    """

    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    roll_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    class_name: Mapped[str] = mapped_column(String(100), nullable=False)
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
    fee_structures: Mapped[List["FeeStructureModel"]] = relationship(
        "FeeStructureModel", back_populates="student", cascade="all, delete-orphan"
    )
    payments: Mapped[List["PaymentModel"]] = relationship(
        "PaymentModel", back_populates="student", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return (
            f"<Student(id={self.id}, "
            f"name='{self.name}', "
            f"roll='{self.roll_number}')>"
        )


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


class RouteModel(Base):
    """
    Route database model.

    Represents a transport route belonging to a branch or organization.
    A route contains an ordered list of stops (bus pickup points) and
    can be assigned to multiple students via StudentRouteMappingModel.

    Columns:
        branch_id: string identifier for the branch (e.g. "BRANCH-01").
            Stored as a plain string because the IMS does not yet have a
            dedicated branches table; this avoids a blocking FK dependency.
        organization_id: optional string identifier for the org/school.
    """

    __tablename__ = "routes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(
        String(255), nullable=False, index=True
    )
    description: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )
    # Plain string IDs — no FK to a branches/orgs table yet.
    # This lets routes be filtered per branch/org without requiring those
    # entities to exist in the DB first.
    branch_id: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True
    )
    organization_id: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, index=True
    )
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

    # One route has many ordered stops.
    # cascade="all, delete-orphan" means deleting the route also deletes
    # its stops automatically — no manual cleanup SQL needed.
    stops: Mapped[List["RouteStopModel"]] = relationship(
        "RouteStopModel",
        back_populates="route",
        cascade="all, delete-orphan",
        order_by="RouteStopModel.sequence_order",
    )

    # Student assignments for this route.
    student_mappings: Mapped[List["StudentRouteMappingModel"]] = relationship(
        "StudentRouteMappingModel",
        back_populates="route",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"<Route(id={self.id}, name='{self.name}', "
            f"branch='{self.branch_id}')>"
        )


class RouteStopModel(Base):
    """
    Route stop database model.

    Represents a single pickup/drop-off stop on a route, storing its
    GPS coordinates and the time the vehicle is expected to arrive.

    sequence_order: integer that controls the order stops are visited
        (e.g. 1 = first stop, 2 = second stop, …). The API sorts stops
        by this field when returning a route so the frontend always
        gets them in the correct travel order.
    arrival_time: stored as a plain string ("HH:MM") because the IMS
        uses simple time strings rather than full datetime objects for
        schedule data.
    """

    __tablename__ = "route_stops"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    route_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("routes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    # GPS coordinates stored as Floats.
    # latitude: -90.0 to +90.0, longitude: -180.0 to +180.0
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    sequence_order: Mapped[int] = mapped_column(Integer, nullable=False)
    # "HH:MM" format, e.g. "07:30"
    arrival_time: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    route: Mapped["RouteModel"] = relationship(
        "RouteModel", back_populates="stops"
    )

    # Students whose pickup_stop is this stop.
    student_mappings: Mapped[List["StudentRouteMappingModel"]] = relationship(
        "StudentRouteMappingModel",
        back_populates="pickup_stop",
        # Null out the FK rather than cascade-delete so removing a stop
        # does not remove the student assignment entirely.
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return (
            f"<RouteStop(id={self.id}, name='{self.name}', "
            f"order={self.sequence_order})>"
        )


class StudentRouteMappingModel(Base):
    """
    Student-to-route mapping model.

    Captures which route a student is assigned to and, optionally,
    which specific stop they board/alight at.

    Why a separate table (not a column on StudentModel):
    - A student might use a different route for morning vs. afternoon.
    - Routes change each academic year; keeping history requires rows,
      not overwriting a column.
    - The acceptance criteria explicitly state DELETE must clean up
      "associated student mappings" — a dedicated table makes that
      simple: cascade from RouteModel handles it automatically.
    """

    __tablename__ = "student_route_mappings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    route_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("routes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    student_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # The specific stop where this student boards the vehicle.
    # Nullable — not every school tracks per-stop boarding.
    pickup_stop_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("route_stops.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    route: Mapped["RouteModel"] = relationship(
        "RouteModel", back_populates="student_mappings"
    )
    student: Mapped["StudentModel"] = relationship("StudentModel")
    pickup_stop: Mapped[Optional["RouteStopModel"]] = relationship(
        "RouteStopModel", back_populates="student_mappings"
    )

    def __repr__(self) -> str:
        return (
            f"<StudentRouteMapping(id={self.id}, "
            f"route={self.route_id}, student={self.student_id})>"
        )
