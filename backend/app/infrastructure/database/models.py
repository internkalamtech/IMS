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

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

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

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    name: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )


# =========================
# CLASS MODEL
# =========================
class ClassSectionModel(Base):
    __tablename__ = "class_sections"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    timetable_entries: Mapped[List["TimetableModel"]] = relationship(
        "TimetableModel",
        back_populates="class_",
        lazy="selectin",
    )


# =========================
# TIMETABLE MODEL
# =========================
class TimetableModel(Base):
    __tablename__ = "timetable"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    teacher_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    subject: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    class_id: Mapped[int] = mapped_column(
        ForeignKey("class_sections.id"),
        nullable=False,
    )

    room_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    start_time: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )
    end_time: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )

    # =========================
    # RELATIONSHIPS
    # =========================
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
