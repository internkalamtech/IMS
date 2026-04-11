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
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
    UniqueConstraint,
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
        String(50),
        unique=True,
        nullable=False,
        index=True,
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


class PaymentModel(Base):
    """
    Payment database model.

    Represents a fee payment transaction made by a student.
    """

    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    payment_method: Mapped[str] = mapped_column(String(100), nullable=False)
    payment_date: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    def __repr__(self) -> str:
        return (
            f"<Payment(id={self.id}, student_id={self.student_id}, "
            f"amount={self.amount})>"
        )


class StudentLedgerModel(Base):
    """
    Student ledger database model.

    Represents a line in the student fee ledger, tracking debits,
    credits, and the running balance.
    """

    __tablename__ = "student_ledger"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    debit: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    credit: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    balance: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    transaction_date: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    def __repr__(self) -> str:
        return (
            f"<StudentLedger(id={self.id}, student_id={self.student_id}, "
            f"balance={self.balance})>"
        )


class FeeStructureModel(Base):
    """
    Fee structure database model.

    Represents the complete fee structure for a class including
    fee heads (breakdown items) and installment schedules.
    """

    __tablename__ = "fee_structures"
    __table_args__ = (
        UniqueConstraint(
            "class_id",
            "academic_year",
            name="uq_fee_structure_class_year",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    class_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )
    academic_year: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True,
    )
    total_fee: Mapped[float] = mapped_column(Float, nullable=False)
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

    # Relationships
    fee_heads: Mapped[List["FeeHeadModel"]] = relationship(
        "FeeHeadModel",
        back_populates="fee_structure",
        cascade="all, delete-orphan",
        lazy="joined",
    )
    installments: Mapped[List["InstallmentModel"]] = relationship(
        "InstallmentModel",
        back_populates="fee_structure",
        cascade="all, delete-orphan",
        lazy="joined",
    )

    def __repr__(self) -> str:
        return (
            f"<FeeStructure(id={self.id}, class_id={self.class_id}, "
            f"academic_year='{self.academic_year}', "
            f"total_fee={self.total_fee})>"
        )


class FeeHeadModel(Base):
    """
    Fee head database model.

    Represents a breakdown item in a fee structure.
    """

    __tablename__ = "fee_heads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    fee_structure_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("fee_structures.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    percentage: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Relationships
    fee_structure: Mapped["FeeStructureModel"] = relationship(
        "FeeStructureModel",
        back_populates="fee_heads",
    )

    def __repr__(self) -> str:
        return (
            f"<FeeHead(id={self.id}, name='{self.name}', "
            f"amount={self.amount})>"
        )


class InstallmentModel(Base):
    """
    Installment database model.

    Represents a payment schedule installment for a fee structure.
    """

    __tablename__ = "installments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    fee_structure_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("fee_structures.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    installment_number: Mapped[int] = mapped_column(Integer, nullable=False)
    due_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Relationships
    fee_structure: Mapped["FeeStructureModel"] = relationship(
        "FeeStructureModel",
        back_populates="installments",
    )

    def __repr__(self) -> str:
        return (
            f"<Installment(id={self.id}, "
            f"installment_number={self.installment_number}, "
            f"due_date={self.due_date}, amount={self.amount})>"
        )


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

    def __repr__(self) -> str:
        return f"<Subject(id={self.id}, name='{self.name}')>"


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

    def __repr__(self) -> str:
        return f"<ClassSection(id={self.id}, name='{self.name}')>"


# Association table for many-to-many relationship
# between ClassSection and Subject
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

