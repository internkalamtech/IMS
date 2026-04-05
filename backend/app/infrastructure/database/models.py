"""
SQLAlchemy database models for the IMS application.

These models represent the database schema using SQLAlchemy ORM.

Best practices followed:
- Declarative base for model definition
- Proper relationships and foreign keys
- Timestamps for audit trail
- Indexes for performance
"""

from datetime import date, datetime
from typing import List

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
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

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
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
        return f"<User(id={self.id}, " f"email='{self.email}', " f"name='{self.name}')>"


class RoleModel(Base):
    """
    Role database model.

    Represents roles like admin, teacher, student, etc.
    """

    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)

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
    fee_structures: Mapped[List["FeeStructureModel"]] = relationship(
        "FeeStructureModel", back_populates="class_section"
    )


class FeeStructureModel(Base):
    """
    Fee structure database model.

    Represents the fee structure header for a class and academic year.
    """

    __tablename__ = "fee_structures"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    class_id: Mapped[int] = mapped_column(
        ForeignKey("class_sections.id", ondelete="CASCADE"), nullable=False
    )
    academic_year: Mapped[str] = mapped_column(String(20), nullable=False)
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)

    # Relationships
    class_section: Mapped["ClassSectionModel"] = relationship(
        "ClassSectionModel", back_populates="fee_structures"
    )
    items: Mapped[List["FeeItemModel"]] = relationship(
        "FeeItemModel", back_populates="structure", cascade="all, delete-orphan"
    )
    installments: Mapped[List["InstallmentPlanModel"]] = relationship(
        "InstallmentPlanModel", back_populates="structure", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return (
            f"<FeeStructure(id={self.id}, "
            f"class_id={self.class_id}, "
            f"academic_year='{self.academic_year}')>"
        )


class FeeItemModel(Base):
    """
    Fee item database model.

    Represents individual fee heads (e.g., Tuition, Lab, Transport).
    """

    __tablename__ = "fee_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    structure_id: Mapped[int] = mapped_column(
        ForeignKey("fee_structures.id", ondelete="CASCADE"), nullable=False
    )
    head_name: Mapped[str] = mapped_column(String(100), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    structure: Mapped["FeeStructureModel"] = relationship(
        "FeeStructureModel", back_populates="items"
    )

    def __repr__(self) -> str:
        return f"<FeeItem(id={self.id}, head_name='{self.head_name}', amount={self.amount})>"


class InstallmentPlanModel(Base):
    """
    Installment plan database model.

    Represents payment due dates and amounts for a fee structure.
    """

    __tablename__ = "fee_installments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    structure_id: Mapped[int] = mapped_column(
        ForeignKey("fee_structures.id", ondelete="CASCADE"), nullable=False
    )
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    structure: Mapped["FeeStructureModel"] = relationship(
        "FeeStructureModel", back_populates="installments"
    )

    def __repr__(self) -> str:
        return (
            f"<InstallmentPlan(id={self.id}, "
            f"due_date={self.due_date}, "
            f"amount={self.amount})>"
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
