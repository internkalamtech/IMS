"""
SQLAlchemy database models for the IMS application.

These models represent the database schema using SQLAlchemy ORM.

Best practices followed:
- Declarative base for model definition
- Proper relationships and foreign keys
- Timestamps for audit trail
- Indexes for performance
"""

from datetime import datetime, time
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
    Time,
    UniqueConstraint,
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


class StudentTransportEnrollmentModel(Base):
    """Mapping between students and their assigned route/stop schedule."""

    __tablename__ = "student_transport_enrollments"
    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "route_id",
            name="uq_student_route_enrollment",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    route_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    stop_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    pickup_time: Mapped[time | None] = mapped_column(
        Time,
        nullable=True,
    )
    dropoff_time: Mapped[time | None] = mapped_column(
        Time,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    student: Mapped["StudentModel"] = relationship("StudentModel")


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


# Association table for many-to-many relationship between students and parents
student_parent_link = Table(
    "student_parent_link",
    Base.metadata,
    Column(
        "student_id",
        Integer,
        ForeignKey("students.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "parent_id",
        Integer,
        ForeignKey("parents.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class StudentModel(Base):
    """
    Student database model.

    Represents a student enrolled in the school, including their fee
    status, parent links, and next payment due date.
    """

    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    roll_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    class_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("class_sections.id", ondelete="SET NULL"),
        nullable=True,
    )
    class_name: Mapped[str] = mapped_column(String(100), nullable=False)
    marks: Mapped[float | None] = mapped_column(Float, nullable=True)
    attendance: Mapped[float | None] = mapped_column(Float, nullable=True)
    next_due_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
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
        "FeeStructureModel",
        back_populates="student",
        cascade="all, delete-orphan",
    )
    payments: Mapped[List["PaymentModel"]] = relationship(
        "PaymentModel", back_populates="student", cascade="all, delete-orphan"
    )
    boardings: Mapped[List["StudentBoardingModel"]] = relationship(
        "StudentBoardingModel",
        back_populates="student",
        cascade="all, delete-orphan",
    )
    parents: Mapped[List["ParentModel"]] = relationship(
        "ParentModel",
        secondary=student_parent_link,
        back_populates="students",
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
    amount_paid: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
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
    payment_mode: Mapped[str] = mapped_column(String(20), nullable=False)
    reference_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Paid")
    remarks: Mapped[str | None] = mapped_column(String(500), nullable=True)
    payment_date: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    student: Mapped["StudentModel"] = relationship(
        "StudentModel", back_populates="payments"
    )
    fee_structure: Mapped["FeeStructureModel"] = relationship(
        "FeeStructureModel", back_populates="payments"
    )


# ============ TRANSPORT MODELS ============


class TripModel(Base):
    """
    Trip database model.

    Represents a vehicle trip assigned to a driver.
    """

    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    driver_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    route_id: Mapped[str] = mapped_column(String(255), nullable=False)
    vehicle_id: Mapped[str] = mapped_column(String(100), nullable=False)
    trip_type: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="scheduled")
    scheduled_start: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    actual_start: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    actual_end: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    total_students: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    boarded_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
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
    driver: Mapped["UserModel"] = relationship("UserModel")
    stops: Mapped[List["TripStopModel"]] = relationship(
        "TripStopModel", back_populates="trip", cascade="all, delete-orphan"
    )
    boardings: Mapped[List["StudentBoardingModel"]] = relationship(
        "StudentBoardingModel", back_populates="trip", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return (
            f"<Trip(id={self.id}, "
            f"driver_id={self.driver_id}, "
            f"status='{self.status}')>"
        )


class TripStopModel(Base):
    """
    Trip Stop database model.

    Represents a specific stop within a trip.
    """

    __tablename__ = "trip_stops"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    trip_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False
    )
    stop_sequence: Mapped[int] = mapped_column(Integer, nullable=False)
    location_name: Mapped[str] = mapped_column(String(255), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    scheduled_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    actual_arrival: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    actual_departure: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    expected_students: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    boarded_students: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
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
    trip: Mapped["TripModel"] = relationship("TripModel", back_populates="stops")

    def __repr__(self) -> str:
        return (
            f"<TripStop(id={self.id}, "
            f"location='{self.location_name}', "
            f"sequence={self.stop_sequence})>"
        )


class StudentBoardingModel(Base):
    """
    Student Boarding database model.

    Tracks which students board/alight during a trip.
    """

    __tablename__ = "student_boardings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    trip_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False
    )
    stop_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("trip_stops.id", ondelete="CASCADE"), nullable=False
    )
    student_name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    boarding_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
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
    trip: Mapped["TripModel"] = relationship("TripModel", back_populates="boardings")
    student: Mapped["StudentModel"] = relationship("StudentModel", back_populates="boardings")
    stop: Mapped["TripStopModel"] = relationship("TripStopModel")

    def __repr__(self) -> str:
        return (
            f"<StudentBoarding(id={self.id}, "
            f"student_id={self.student_id}, "
            f"trip_id={self.trip_id}, "
            f"status='{self.status}')>"
        )


class ParentModel(Base):
    """
    Parent database model.

    Represents a parent/guardian with contact information and
    associations to one or more students.
    """

    __tablename__ = "parents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    relationship_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default="Parent"
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
    students: Mapped[List["StudentModel"]] = relationship(
        "StudentModel",
        secondary=student_parent_link,
        back_populates="parents",
    )

    def __repr__(self) -> str:
        return (
            f"<Parent(id={self.id}, "
            f"name='{self.name}', "
            f"email='{self.email}')>"
        )
