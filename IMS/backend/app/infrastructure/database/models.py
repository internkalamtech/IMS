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


class ClassModel(Base):
    """
    Class database model.

    Represents an academic class and its assigned class teacher.
    """

    __tablename__ = "classes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    teacher_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    teacher: Mapped["UserModel | None"] = relationship(
        "UserModel", foreign_keys=[teacher_id]
    )

    def __repr__(self) -> str:
        return f"<Class(id={self.id}, name='{self.name}', teacher_id={self.teacher_id})>"


class StudentModel(Base):
    """
    Student profile database model.

    Extends user with student-specific information.
    """

    __tablename__ = "students"

    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True, index=True
    )
    roll_number: Mapped[str] = mapped_column(String(50), nullable=False)
    class_assigned: Mapped[str] = mapped_column(String(100), nullable=False)
    date_of_birth: Mapped[str | None] = mapped_column(String(10), nullable=True)
    blood_group: Mapped[str | None] = mapped_column(String(10), nullable=True)
    parent_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    user: Mapped["UserModel"] = relationship("UserModel", foreign_keys=[user_id])
    parent: Mapped["UserModel | None"] = relationship(
        "UserModel", foreign_keys=[parent_id]
    )

    def __repr__(self) -> str:
        return f"<Student(user_id={self.user_id}, roll_number='{self.roll_number}')>"


class TeacherModel(Base):
    """
    Teacher profile database model.

    Extends user with teacher-specific information.
    """

    __tablename__ = "teachers"

    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True, index=True
    )
    subjects: Mapped[str] = mapped_column(String(500), nullable=False)  # JSON array
    classes_assigned: Mapped[str] = mapped_column(String(500), nullable=False)  # JSON array
    employee_id: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Relationships
    user: Mapped["UserModel"] = relationship("UserModel")

    def __repr__(self) -> str:
        return f"<Teacher(user_id={self.user_id}, employee_id='{self.employee_id}')>"


class ParentModel(Base):
    """
    Parent profile database model.

    Extends user with parent-specific information.
    """

    __tablename__ = "parents"

    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True, index=True
    )
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    children_ids: Mapped[str] = mapped_column(String(1000), nullable=False)  # JSON array

    # Relationships
    user: Mapped["UserModel"] = relationship("UserModel")

    def __repr__(self) -> str:
        return f"<Parent(user_id={self.user_id}, phone='{self.phone}')>"


class TransportModel(Base):
    """
    Transport staff profile database model.

    Extends user with transport-specific information.
    """

    __tablename__ = "transport_staff"

    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True, index=True
    )
    license_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    vehicle_assigned: Mapped[str | None] = mapped_column(String(100), nullable=True)
    employee_id: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Relationships
    user: Mapped["UserModel"] = relationship("UserModel")

    def __repr__(self) -> str:
        return f"<Transport(user_id={self.user_id}, employee_id='{self.employee_id}')>"
