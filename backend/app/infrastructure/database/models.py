"""
SQLAlchemy database models for the IMS application.

These models represent the database schema using SQLAlchemy ORM.
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
    """User database model."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    name: Mapped[str] = mapped_column(
        String(255), nullable=False
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

    roles: Mapped[List["RoleModel"]] = relationship(
        "RoleModel",
        secondary=user_roles,
        back_populates="users",
        lazy="joined",
    )


class RoleModel(Base):
    """Role database model."""

    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    name: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    description: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )

    users: Mapped[List["UserModel"]] = relationship(
        "UserModel",
        secondary=user_roles,
        back_populates="roles",
    )


# Association table for many-to-many relationship between class section and subject
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


class SubjectModel(Base):
    """Subject database model."""

    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    classes: Mapped[List["ClassSectionModel"]] = relationship(
        "ClassSectionModel",
        secondary=class_subject_link,
        back_populates="subjects",
    )


class ClassSectionModel(Base):
    """Class section database model."""

    __tablename__ = "class_sections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    subjects: Mapped[List["SubjectModel"]] = relationship(
        "SubjectModel",
        secondary=class_subject_link,
        back_populates="classes",
    )


class TeacherModel(Base):
    """Teacher database model."""

    __tablename__ = "teachers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    employee_id: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False
    )
    specialization: Mapped[str | None] = mapped_column(
        String(100), nullable=True
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

    user: Mapped["UserModel"] = relationship(
        "UserModel", backref="teacher_profile"
    )
    timetable_periods: Mapped[List["TimetablePeriodModel"]] = relationship(
        "TimetablePeriodModel",
        back_populates="teacher",
    )


class RoomModel(Base):
    """Room database model."""

    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    room_type: Mapped[str] = mapped_column(String(50), nullable=False)
    capacity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    timetable_periods: Mapped[List["TimetablePeriodModel"]] = relationship(
        "TimetablePeriodModel",
        back_populates="room",
    )


class TimetablePeriodModel(Base):
    """Timetable period database model."""

    __tablename__ = "timetable_periods"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    class_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("class_sections.id"), nullable=False
    )
    subject_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("subjects.id"), nullable=False
    )
    teacher_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("teachers.id"), nullable=False
    )
    room_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("rooms.id"), nullable=False
    )
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)
    start_time: Mapped[str] = mapped_column(String(10), nullable=False)
    end_time: Mapped[str] = mapped_column(String(10), nullable=False)
    period_number: Mapped[int] = mapped_column(Integer, nullable=False)
    is_break: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    class_section: Mapped["ClassSectionModel"] = relationship(
        "ClassSectionModel"
    )
    subject: Mapped["SubjectModel"] = relationship("SubjectModel")
    teacher: Mapped["TeacherModel"] = relationship(
        "TeacherModel",
        back_populates="timetable_periods",
    )
    room: Mapped["RoomModel"] = relationship(
        "RoomModel", back_populates="timetable_periods"
    )


# Association table for many-to-many relationship between parent and student
parent_student = Table(
    "parent_student",
    Base.metadata,
    Column(
        "parent_id",
        Integer,
        ForeignKey("parents.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "student_id",
        Integer,
        ForeignKey("students.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class StudentModel(Base):
    """Student database model used by timetable and payment features."""

    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )
    roll_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    class_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("class_sections.id"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
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

    user: Mapped[Optional["UserModel"]] = relationship(
        "UserModel", backref="student_profile"
    )
    class_section: Mapped[Optional["ClassSectionModel"]] = relationship(
        "ClassSectionModel"
    )
    parents: Mapped[List["ParentModel"]] = relationship(
        "ParentModel",
        secondary=parent_student,
        back_populates="students",
    )
    fee_structures: Mapped[List["FeeStructureModel"]] = relationship(
        "FeeStructureModel",
        back_populates="student",
        cascade="all, delete-orphan",
    )
    payments: Mapped[List["PaymentModel"]] = relationship(
        "PaymentModel",
        back_populates="student",
        cascade="all, delete-orphan",
    )


class ParentModel(Base):
    """Parent database model."""

    __tablename__ = "parents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    phone: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )
    address: Mapped[str | None] = mapped_column(
        String(255), nullable=True
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

    user: Mapped["UserModel"] = relationship("UserModel", backref="parent_profile")
    students: Mapped[List["StudentModel"]] = relationship(
        "StudentModel",
        secondary=parent_student,
        back_populates="parents",
    )


class FeeStructureModel(Base):
    """Fee structure database model."""

    __tablename__ = "fee_structures"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False
    )
    total_fee: Mapped[float] = mapped_column(
        Float, nullable=False
    )
    amount_paid: Mapped[float] = mapped_column(
        Float, default=0.0, nullable=False
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


class PaymentModel(Base):
    """Payment database model."""

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
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Paid")
    reference_number: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )
    remarks: Mapped[str | None] = mapped_column(
        String(500), nullable=True
    )
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

    student: Mapped["StudentModel"] = relationship(
        "StudentModel", back_populates="payments"
    )
    fee_structure: Mapped["FeeStructureModel"] = relationship(
        "FeeStructureModel",
        back_populates="payments",
    )
