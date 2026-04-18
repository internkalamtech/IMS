from __future__ import annotations

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
    Text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


# ================================================================
# EXAM & ACADEMIC PERFORMANCE MODELS
# ================================================================


class ExamModel(Base):
    """
    Exam database model.

    Represents exam schedules and metadata for classes.
    """

    __tablename__ = "exams"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    class_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("class_sections.id", ondelete="CASCADE"), nullable=False
    )
    academic_year: Mapped[str] = mapped_column(
        String(20), nullable=False, default="2026-27"
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
    schedules: Mapped[List["ExamScheduleModel"]] = relationship(
        "ExamScheduleModel", back_populates="exam", cascade="all, delete-orphan"
    )
    results: Mapped[List["StudentResultModel"]] = relationship(
        "StudentResultModel", back_populates="exam", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Exam(id={self.id}, title='{self.title}')>"


class ExamScheduleModel(Base):
    """
    Exam schedule database model.

    Represents individual exam schedules with dates and subjects.
    """

    __tablename__ = "exam_schedules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    exam_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False
    )
    subject_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False
    )
    exam_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    max_marks: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=60)
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
    exam: Mapped["ExamModel"] = relationship("ExamModel", back_populates="schedules")
    subject: Mapped["SubjectModel"] = relationship("SubjectModel")

    def __repr__(self) -> str:
        return f"<ExamSchedule(id={self.id}, exam_id={self.exam_id})>"


class StudentResultModel(Base):
    """
    Student result database model.

    Represents the overall result for a student in an exam.
    """

    __tablename__ = "student_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    exam_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False
    )
    total_marks: Mapped[float] = mapped_column(Float, nullable=False)
    obtained_marks: Mapped[float] = mapped_column(Float, nullable=False)
    percentage: Mapped[float] = mapped_column(Float, nullable=False)
    grade: Mapped[str] = mapped_column(String(5), nullable=False)  # A+, A, B, C, D, F
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="Pass"
    )  # Pass/Fail
    rank: Mapped[int | None] = mapped_column(Integer, nullable=True)
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
    student: Mapped["StudentModel"] = relationship("StudentModel")
    exam: Mapped["ExamModel"] = relationship("ExamModel", back_populates="results")
    subject_results: Mapped[List["SubjectResultModel"]] = relationship(
        "SubjectResultModel", back_populates="result", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return (
            f"<StudentResult(id={self.id}, student_id={self.student_id}, "
            f"exam_id={self.exam_id})>"
        )


class SubjectResultModel(Base):
    """
    Subject-wise result database model.

    Represents marks obtained in individual subjects within an exam.
    """

    __tablename__ = "subject_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    result_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("student_results.id", ondelete="CASCADE"), nullable=False
    )
    subject_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False
    )
    obtained_marks: Mapped[float] = mapped_column(Float, nullable=False)
    max_marks: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)
    percentage: Mapped[float] = mapped_column(Float, nullable=False)
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
    result: Mapped["StudentResultModel"] = relationship(
        "StudentResultModel", back_populates="subject_results"
    )
    subject: Mapped["SubjectModel"] = relationship("SubjectModel")

    def __repr__(self) -> str:
        return f"<SubjectResult(id={self.id}, result_id={self.result_id})>"


# ================================================================
# CONDUCT & BEHAVIORAL MODELS
# ================================================================


class ConductRemarkModel(Base):
    """
    Conduct remark database model.

    Represents behavioral remarks and feedback from teachers.
    """

    __tablename__ = "conduct_remarks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    teacher_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    category: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # Academic, Discipline, Attitude
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    remarks: Mapped[str] = mapped_column(Text, nullable=False)
    is_acknowledged: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    acknowledged_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
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
    student: Mapped["StudentModel"] = relationship("StudentModel")
    teacher: Mapped["UserModel"] = relationship("UserModel")
    replies: Mapped[List["ConductReplyModel"]] = relationship(
        "ConductReplyModel", back_populates="remark", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return (
            f"<ConductRemark(id={self.id}, student_id={self.student_id}, "
            f"category='{self.category}')>"
        )


class ConductReplyModel(Base):
    """
    Conduct reply database model.

    Represents parent replies/acknowledgements to conduct remarks.
    """

    __tablename__ = "conduct_replies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    remark_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("conduct_remarks.id", ondelete="CASCADE"), nullable=False
    )
    parent_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    reply_text: Mapped[str] = mapped_column(Text, nullable=False)
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
    remark: Mapped["ConductRemarkModel"] = relationship(
        "ConductRemarkModel", back_populates="replies"
    )
    parent: Mapped["UserModel"] = relationship("UserModel")

    def __repr__(self) -> str:
        return f"<ConductReply(id={self.id}, remark_id={self.remark_id})>"


# ================================================================
# SUPPORTING ENTITIES
# ================================================================

user_roles = Table(
    "user_roles",
    Base.metadata,
    Column(
        "user_id",
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "role_id",
        ForeignKey("roles.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class UserModel(Base):
    """User database model."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), nullable=False, unique=True, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    roles: Mapped[list["RoleModel"]] = relationship(
        "RoleModel",
        secondary=user_roles,
        back_populates="users",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}')>"


class RoleModel(Base):
    """Role database model."""

    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    users: Mapped[list["UserModel"]] = relationship(
        "UserModel",
        secondary=user_roles,
        back_populates="roles",
    )

    def __repr__(self) -> str:
        return f"<Role(id={self.id}, name='{self.name}')>"


class ClassSectionModel(Base):
    """Class section database model."""

    __tablename__ = "class_sections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    def __repr__(self) -> str:
        return f"<ClassSection(id={self.id}, name='{self.name}')>"


class StudentModel(Base):
    """Student database model."""

    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    class_section_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("class_sections.id", ondelete="SET NULL"), nullable=True
    )

    def __repr__(self) -> str:
        return f"<Student(id={self.id}, name='{self.name}')>"


class SubjectModel(Base):
    """Subject database model."""

    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    def __repr__(self) -> str:
        return f"<Subject(id={self.id}, name='{self.name}')>"
