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
 feature/student-profile-ui
    Float,
    Text,
  main
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
  feature/student-profile-ui
    """Base class for all database models."""
 main
    pass


# =========================
# ASSOCIATION TABLES
# =========================

user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
)

class_subject_link = Table(
    "class_subject_link",
    Base.metadata,
    Column("class_id", Integer, ForeignKey("class_sections.id", ondelete="CASCADE"), primary_key=True),
    Column("subject_id", Integer, ForeignKey("subjects.id", ondelete="CASCADE"), primary_key=True),
)

student_parent_link = Table(
    "student_parent_link",
    Base.metadata,
    Column("student_id", Integer, ForeignKey("students.id", ondelete="CASCADE"), primary_key=True),
    Column("parent_id", Integer, ForeignKey("parents.id", ondelete="CASCADE"), primary_key=True),
)

feature/student-profile-ui
# =========================
# 👤 USER MODEL
# =========================
class UserModel(Base):
    """
    User database model.
 main

# =========================
# CORE MODELS
# =========================

class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

 feature/student-profile-ui
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

 main
    roles: Mapped[List["RoleModel"]] = relationship(
        "RoleModel",
        secondary=user_roles,
        back_populates="users",
        lazy="joined",
    )


# =========================
# 🎭 ROLE MODEL
# =========================
class RoleModel(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    users: Mapped[List["UserModel"]] = relationship(
        "UserModel",
        secondary=user_roles,
        back_populates="roles",
    )


# =========================
# ACADEMIC MODELS
# =========================

# =========================
# 📚 HOMEWORK MODEL
# =========================
class HomeworkModel(Base):
    __tablename__ = "homeworks"

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)

    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)

    subject: Mapped[str] = mapped_column(String(100))
    className: Mapped[str] = mapped_column(String(50))

    dueDate: Mapped[str] = mapped_column(String(50))

    assignType: Mapped[str] = mapped_column(String(20))  # ALL / INDIVIDUAL

    students: Mapped[str] = mapped_column(Text)  # comma-separated

    teacherId: Mapped[str] = mapped_column(String(255))

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    def __repr__(self) -> str:
        return f"<Homework(id={self.id}, title='{self.title}')>"
class SubjectModel(Base):
    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    classes: Mapped[List["ClassSectionModel"]] = relationship(
        "ClassSectionModel",
        secondary=class_subject_link,
        back_populates="subjects",
    )


class ClassSectionModel(Base):
    __tablename__ = "class_sections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    subjects: Mapped[List["SubjectModel"]] = relationship(
        "SubjectModel",
        secondary=class_subject_link,
        back_populates="classes",
    )


# =========================
# STUDENT MODEL
# =========================

class StudentModel(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    roll_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    class_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("class_sections.id", ondelete="SET NULL"),
        nullable=True,
    )
    class_name: Mapped[str] = mapped_column(String(100), nullable=False)
    marks: Mapped[float | None] = mapped_column(Float, nullable=True)
    attendance: Mapped[float | None] = mapped_column(Float, nullable=True)
    next_due_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

 feature/student-profile-ui
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

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
main
    parents: Mapped[List["ParentModel"]] = relationship(
        "ParentModel",
        secondary=student_parent_link,
        back_populates="students",
    )


# =========================
# PARENT MODEL
# =========================

class ParentModel(Base):
    __tablename__ = "parents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    relationship_type: Mapped[str] = mapped_column(String(50), nullable=False, default="Parent")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    students: Mapped[List["StudentModel"]] = relationship(
        "StudentModel",
        secondary=student_parent_link,
        back_populates="parents",
    )


# =========================
# PAYMENT MODELS
# =========================

class FeeStructureModel(Base):
    __tablename__ = "fee_structures"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    total_fee: Mapped[float] = mapped_column(Float, nullable=False)
    amount_paid: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    student: Mapped["StudentModel"] = relationship("StudentModel")


class PaymentModel(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)

    student_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
    )

    student: Mapped["StudentModel"] = relationship("StudentModel")


# =========================
# 🚍 TRIP MODELS (FULLY FIXED)
# =========================

class TripModel(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    driver_id: Mapped[int] = mapped_column(Integer, nullable=False)
    route_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    vehicle_id: Mapped[int | None] = mapped_column(Integer, nullable=True)

    trip_type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)

    scheduled_start: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    actual_start: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    actual_end: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    total_students: Mapped[int] = mapped_column(Integer, default=0)
    boarded_count: Mapped[int] = mapped_column(Integer, default=0)

    notes: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TripStopModel(Base):
    __tablename__ = "trip_stops"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    trip_id: Mapped[int] = mapped_column(Integer, ForeignKey("trips.id", ondelete="CASCADE"))

    stop_sequence: Mapped[int] = mapped_column(Integer, nullable=False)
    location_name: Mapped[str] = mapped_column(String(255), nullable=False)

    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    scheduled_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    actual_arrival: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    actual_departure: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    expected_students: Mapped[int] = mapped_column(Integer, default=0)
    boarded_students: Mapped[int] = mapped_column(Integer, default=0)

    status: Mapped[str] = mapped_column(String(50), default="PENDING")
    notes: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class StudentBoardingModel(Base):
    __tablename__ = "student_boardings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    trip_id: Mapped[int] = mapped_column(Integer, ForeignKey("trips.id", ondelete="CASCADE"))
    stop_id: Mapped[int] = mapped_column(Integer, ForeignKey("trip_stops.id", ondelete="CASCADE"))

    student_id: Mapped[int] = mapped_column(Integer, nullable=False)
    student_name: Mapped[str] = mapped_column(String(255), nullable=False)

    status: Mapped[str] = mapped_column(String(50), default="PENDING")

    boarding_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str | None] = mapped_column(String(255), nullable=True)

feature/student-profile-ui
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return (
            f"<Parent(id={self.id}, "
            f"name='{self.name}', "
            f"email='{self.email}')>"
        )


class StaffModel(Base):
    """
    Staff database model.

    Single table to store staff common fields and optional,
    role-specific columns (nullable).
    """

    __tablename__ = "staff"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(50), nullable=False)

    # Role-specific optional fields
    class_assigned_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("class_sections.id", ondelete="SET NULL"), nullable=True
    )
    class_assigned_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    subjects: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    license: Mapped[str | None] = mapped_column(String(255), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    class_assigned: Mapped["ClassSectionModel"] = relationship("ClassSectionModel")

    def __repr__(self) -> str:
        return (
            f"<Staff(id={self.id}, "
            f"email='{self.email}', "
            f"name='{self.name}', "
            f"role='{self.role}')>"
        )
class DocumentModel(Base):
    """
    Compliance Document database model.

    Represents an uploaded document with metadata for expiry tracking.
    """

    __tablename__ = "compliance_documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)

    # Metadata for filtering
    branch: Mapped[str | None] = mapped_column(
        String(100), nullable=True, index=True
    )
    scope: Mapped[str | None] = mapped_column(
        String(50), nullable=True, index=True
    )  # e.g., 'branch', 'organizational'

    # Expiry tracking
    upload_date: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
    expiry_date: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        index=True,
    )

    # Relations
    uploaded_by_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    uploaded_by: Mapped["UserModel"] = relationship(
        "UserModel", foreign_keys=[uploaded_by_id]
    )

    def __repr__(self) -> str:
        return f"<Document(id={self.id}, title='{self.title}')>"
 main
