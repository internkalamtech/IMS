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
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


# =========================
# BASE
# =========================
class Base(DeclarativeBase):
    pass


# =========================
# USER - ROLE MAPPING
# =========================
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
# USER MODEL
# =========================
class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    roles: Mapped[List["RoleModel"]] = relationship(
        "RoleModel",
        secondary=user_roles,
        lazy="selectin",
    )

    teacher_timetable: Mapped[List["TimetableModel"]] = relationship(
        "TimetableModel",
        back_populates="teacher",
        lazy="selectin",
    )


# =========================
# ROLE MODEL
# =========================
class RoleModel(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)


# =========================
# CLASS MODEL
# =========================
class ClassSectionModel(Base):
    __tablename__ = "class_sections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    timetable_entries: Mapped[List["TimetableModel"]] = relationship(
        "TimetableModel",
        back_populates="class_",
        lazy="selectin",
    )


# =========================
# TIMETABLE MODEL (YOUR FEATURE)
# =========================
class TimetableModel(Base):
    __tablename__ = "timetable"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    teacher_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    subject: Mapped[str] = mapped_column(String(100), nullable=False)

    class_id: Mapped[int] = mapped_column(
        ForeignKey("class_sections.id"),
        nullable=False,
    )

    room_type: Mapped[str] = mapped_column(String(50), nullable=False)

    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    class_: Mapped["ClassSectionModel"] = relationship(
        "ClassSectionModel",
        back_populates="timetable_entries",
        lazy="selectin",
    )

    teacher: Mapped["UserModel"] = relationship(
        "UserModel",
        back_populates="teacher_timetable",
        lazy="selectin",
    )


# =========================
# ASSOCIATION TABLE
# =========================
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


# =========================
# STUDENT MODEL
# =========================
class StudentModel(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    roll_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    class_name: Mapped[str] = mapped_column(String(100), nullable=False)
    next_due_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    fee_structures: Mapped[List["FeeStructureModel"]] = relationship(
        "FeeStructureModel", back_populates="student", cascade="all, delete-orphan"
    )

    payments: Mapped[List["PaymentModel"]] = relationship(
        "PaymentModel", back_populates="student", cascade="all, delete-orphan"
    )


# =========================
# FEE STRUCTURE MODEL
# =========================
class FeeStructureModel(Base):
    __tablename__ = "fee_structures"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), nullable=False)

    total_fee: Mapped[float] = mapped_column(Float, nullable=False)
    amount_paid: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    fee_type: Mapped[str] = mapped_column(String(100), nullable=False, default="Tuition")
    academic_year: Mapped[str] = mapped_column(String(20), nullable=False, default="2024-25")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    student: Mapped["StudentModel"] = relationship("StudentModel", back_populates="fee_structures")

    payments: Mapped[List["PaymentModel"]] = relationship(
        "PaymentModel", back_populates="fee_structure", cascade="all, delete-orphan"
    )

    @property
    def balance(self) -> float:
        return self.total_fee - self.amount_paid


# =========================
# PAYMENT MODEL
# =========================
class PaymentModel(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    fee_structure_id: Mapped[int] = mapped_column(ForeignKey("fee_structures.id", ondelete="CASCADE"), nullable=False)

    receipt_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)

    payment_mode: Mapped[str] = mapped_column(String(20), nullable=False)
    reference_number: Mapped[str | None] = mapped_column(String(100), nullable=True)

    status: Mapped[str] = mapped_column(String(20), default="Paid", nullable=False)
    remarks: Mapped[str | None] = mapped_column(String(500), nullable=True)

    payment_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    student: Mapped["StudentModel"] = relationship("StudentModel", back_populates="payments")
    fee_structure: Mapped["FeeStructureModel"] = relationship("FeeStructureModel", back_populates="payments")
    