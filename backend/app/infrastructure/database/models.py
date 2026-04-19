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
    Text,
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


# =========================
# 👤 USER MODEL
# =========================
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


# =========================
# 🎭 ROLE MODEL
# =========================
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

    users: Mapped[List["UserModel"]] = relationship(
        "UserModel",
        secondary=user_roles,
        back_populates="roles",
    )

    def __repr__(self) -> str:
        return f"<Role(id={self.id}, name='{self.name}')>"


 # NOTE: The parent/student association table is defined later in this file
 # as student_parent_link (students ↔ parents). Do not redefine it here.


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
    marked_by_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    student: Mapped["UserModel"] = relationship("UserModel", foreign_keys=[student_id])


class LeaveRequestModel(Base):
    """
    Leave request submitted by a parent for a student.
    status: 'pending' | 'approved' | 'rejected'
    """
    __tablename__ = "leave_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    submitted_by_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    reason: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    teacher_note: Mapped[str | None] = mapped_column(String(500), nullable=True)
    reviewed_by_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    applied_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    student: Mapped["UserModel"] = relationship("UserModel", foreign_keys=[student_id])
    submitted_by: Mapped["UserModel | None"] = relationship("UserModel", foreign_keys=[submitted_by_id])
    reviewed_by: Mapped["UserModel | None"] = relationship("UserModel", foreign_keys=[reviewed_by_id])


class HomeworkModel(Base):
    """
    Homework database model for lifecycle management and dashboards.
    """
    __tablename__ = "homeworks"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    subject: Mapped[str] = mapped_column(String(100))
    className: Mapped[str | None] = mapped_column(String(50), nullable=True)
    dueDate: Mapped[str | None] = mapped_column(String(50), nullable=True)
    assignType: Mapped[str | None] = mapped_column(String(20), nullable=True)  # ALL / INDIVIDUAL
    students: Mapped[str | None] = mapped_column(Text, nullable=True)  # comma-separated
    teacherId: Mapped[str | None] = mapped_column(String(255), nullable=True)
    child_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    status: Mapped[str | None] = mapped_column(String(20), nullable=True, default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<Homework(id={self.id}, title='{self.title}')>"
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


# Association table for many-to-many relationship between
# Students and Parents
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

# Alias for convenience in attendance endpoints
parent_student = student_parent_link


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
    class_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("class_sections.id", ondelete="SET NULL"), nullable=True
    )
    class_name: Mapped[str] = mapped_column(String(100), nullable=False)
    marks: Mapped[float] = mapped_column(nullable=False)
    attendance: Mapped[float] = mapped_column(nullable=True)
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
    )  # Parent, Guardian, etc.
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

