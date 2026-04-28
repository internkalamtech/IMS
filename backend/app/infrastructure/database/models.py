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


class_subject_association = Table(
    "class_subjects",
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


class ClassSectionModel(Base):
    """Represents a class section in the system."""

    __tablename__ = "class_sections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    section: Mapped[str] = mapped_column(String(100), nullable=False)
    academic_period_id: Mapped[int] = mapped_column(Integer, nullable=False)
    teacher_user_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    subject: Mapped[str | None] = mapped_column(String(255), nullable=True)
    total_students: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    teacher: Mapped["UserModel" | None] = relationship(
        "UserModel",
        lazy="joined",
        foreign_keys=[teacher_user_id],
        uselist=False,
    )
    subjects: Mapped[List["SubjectModel"]] = relationship(
        "SubjectModel",
        secondary=class_subject_association,
        back_populates="classes",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return (
            f"<ClassSection(id={self.id}, name='{self.name}', section='{self.section}')>"
        )


class SubjectModel(Base):
    """Represents a subject that can be associated with a class."""

    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)

    classes: Mapped[List[ClassSectionModel]] = relationship(
        "ClassSectionModel",
        secondary=class_subject_association,
        back_populates="subjects",
    )

    def __repr__(self) -> str:
        return f"<Subject(id={self.id}, name='{self.name}')>"
