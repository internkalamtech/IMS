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


# Association table linking parents to their children (students)
parent_student = Table(
    "parent_student",
    Base.metadata,
    Column("parent_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("student_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
)


class AttendanceModel(Base):
    """
    Daily attendance record for a student.
    status: 'present' | 'absent' | 'leave' | 'holiday' | 'not-marked'
    """
    __tablename__ = "attendances"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="not-marked")
    marked_by_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    student: Mapped["UserModel"] = relationship("UserModel", foreign_keys=[student_id])


class LeaveRequestModel(Base):
    """
    Leave request submitted by a parent for a student.
    status: 'pending' | 'approved' | 'rejected'
    """
    __tablename__ = "leave_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    reason: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    teacher_note: Mapped[str | None] = mapped_column(String(500), nullable=True)
    reviewed_by_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    applied_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    student: Mapped["UserModel"] = relationship("UserModel", foreign_keys=[student_id])
