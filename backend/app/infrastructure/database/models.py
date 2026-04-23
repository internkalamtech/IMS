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


# Association table for many-to-many relationship between ClassSection and Subject
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


# Association table for many-to-many relationship between Students and Parents
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


class UserModel(Base):
    """
    User database model.

    Represents a user with authentication credentials and associated roles.
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

    roles: Mapped[List["RoleModel"]] = relationship(
        "RoleModel",
        secondary=user_roles,
        back_populates="users",
        lazy="joined",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', name='{self.name}')>"


class RoleModel(Base):
    """
    Role database model.

    Represents a role that can be assigned to users.
    """
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    users: Mapped[List["UserModel"]] = relationship(
        "UserModel", secondary=user_roles, back_populates="roles"
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
        secondary=class_subject_link,
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
        secondary=class_subject_link,
        back_populates="classes",
    )

    def __repr__(self) -> str:
        return f"<ClassSection(id={self.id}, name='{self.name}')>"


class StudentModel(Base):
    """
    Student database model.

    Represents a student in the IMS system.
    """
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    enrollment_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
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
    parents: Mapped[List["ParentModel"]] = relationship(
        "ParentModel",
        secondary=student_parent_link,
        back_populates="students",
    )

    def __repr__(self) -> str:
        return f"<Student(id={self.id}, enrollment_number='{self.enrollment_number}')>"


class FeeStructureModel(Base):
    """
    Fee structure database model.

    Represents different types of fees in the IMS system.
    """
    __tablename__ = "fee_structures"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    total_fee: Mapped[float] = mapped_column(Float, nullable=False)
    amount_paid: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    fee_type: Mapped[str] = mapped_column(String(100), nullable=False, default="Tuition")
    academic_year: Mapped[str] = mapped_column(String(20), nullable=False, default="2024-25")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
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
        return self.total_fee - self.amount_paid

    def __repr__(self) -> str:
        return f"<FeeStructure(id={self.id}, student_id={self.student_id}, total={self.total_fee})>"


class PaymentModel(Base):
    """
    Payment database model.

    Represents payments made by students for various fees.
    """
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    fee_structure_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("fee_structures.id", ondelete="CASCADE"), nullable=False
    )
    receipt_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    payment_mode: Mapped[str] = mapped_column(String(20), nullable=False)
    reference_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Paid")
    remarks: Mapped[str | None] = mapped_column(String(500), nullable=True)
    payment_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    student: Mapped["StudentModel"] = relationship("StudentModel", back_populates="payments")
    fee_structure: Mapped["FeeStructureModel"] = relationship(
        "FeeStructureModel", back_populates="payments"
    )

    def __repr__(self) -> str:
        return f"<Payment(id={self.id}, receipt='{self.receipt_number}', amount={self.amount}, status='{self.status}')>"


class ParentModel(Base):
    """
    Parent database model.

    Represents a parent/guardian with contact information and student links.
    """
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
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    students: Mapped[List["StudentModel"]] = relationship(
        "StudentModel",
        secondary=student_parent_link,
        back_populates="parents",
    )

    def __repr__(self) -> str:
        return f"<Parent(id={self.id}, name='{self.name}', email='{self.email}')>"
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


# Association table for many-to-many relationship between ClassSection and Subject
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


# Association table for many-to-many relationship between Students and Parents
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


class UserModel(Base):
    """
    User database model.

    Represents a user with authentication credentials and associated roles.
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

    roles: Mapped[List["RoleModel"]] = relationship(
        "RoleModel",
        secondary=user_roles,
        back_populates="users",
        lazy="joined",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', name='{self.name}')>"


class RoleModel(Base):
    """
    Role database model.

    Represents a role that can be assigned to users.
    """
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    users: Mapped[List["UserModel"]] = relationship(
        "UserModel", secondary=user_roles, back_populates="roles"
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
        secondary=class_subject_link,
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
        secondary=class_subject_link,
        back_populates="classes",
    )

    def __repr__(self) -> str:
        return f"<ClassSection(id={self.id}, name='{self.name}')>"


class StudentModel(Base):
    """
    Student database model.

    Represents a student in the IMS system.
    """
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    class_name: Mapped[str] = mapped_column(String(100), nullable=False)
    marks: Mapped[float] = mapped_column(nullable=False)
    attendance: Mapped[float] = mapped_column(nullable=True)
    next_due_date: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True
    )
    enrollment_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
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
    parents: Mapped[List["ParentModel"]] = relationship(
        "ParentModel",
        secondary=student_parent_link,
        back_populates="students",
    )

    def __repr__(self) -> str:
        return f"<Student(id={self.id}, enrollment_number='{self.enrollment_number}')>"


class FeeStructureModel(Base):
    """
    Fee structure database model.

    Represents different types of fees in the IMS system.
    """
    __tablename__ = "fee_structures"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    total_fee: Mapped[float] = mapped_column(Float, nullable=False)
    amount_paid: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    fee_type: Mapped[str] = mapped_column(String(100), nullable=False, default="Tuition")
    academic_year: Mapped[str] = mapped_column(String(20), nullable=False, default="2024-25")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
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
        return self.total_fee - self.amount_paid

    def __repr__(self) -> str:
        return f"<FeeStructure(id={self.id}, student_id={self.student_id}, total={self.total_fee})>"


class PaymentModel(Base):
    """
    Payment database model.

    Represents payments made by students for various fees.
    """
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    fee_structure_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("fee_structures.id", ondelete="CASCADE"), nullable=False
    )
    receipt_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    payment_mode: Mapped[str] = mapped_column(String(20), nullable=False)
    reference_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Paid")
    remarks: Mapped[str | None] = mapped_column(String(500), nullable=True)
    payment_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    student: Mapped["StudentModel"] = relationship("StudentModel", back_populates="payments")
    fee_structure: Mapped["FeeStructureModel"] = relationship(
        "FeeStructureModel", back_populates="payments"
    )

    def __repr__(self) -> str:
        return f"<Payment(id={self.id}, receipt='{self.receipt_number}', amount={self.amount}, status='{self.status}')>"


class ParentModel(Base):
    """
    Parent database model.

    Represents a parent/guardian with contact information and student links.
    """
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
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    students: Mapped[List["StudentModel"]] = relationship(
        "StudentModel",
        secondary=student_parent_link,
        back_populates="parents",
    )

    def __repr__(self) -> str:
        return f"<Parent(id={self.id}, name='{self.name}', email='{self.email}')>"
