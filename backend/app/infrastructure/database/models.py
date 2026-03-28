from datetime import datetime

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
from sqlalchemy.orm import relationship

from app.infrastructure.database.database import Base

# -------------------------
# Association Table
# -------------------------
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("role_id", Integer, ForeignKey("roles.id"), primary_key=True),
)


# -------------------------
# User Model
# -------------------------
class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)


roles = relationship(
    "Role",
    secondary=user_roles,
    back_populates="users",
    lazy="selectin",
)


# -------------------------
# Role Model
# -------------------------
class RoleModel(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)

    users = relationship(
        "UserModel",
        secondary=user_roles,
        back_populates="roles",
    )


# -------------------------
# FeeStructure Model
# -------------------------
class FeeStructure(Base):
    __tablename__ = "fee_structures"

    id = Column(Integer, primary_key=True, index=True)
    student_class = Column(String, unique=True, nullable=False)
    fee_amount = Column(Float, nullable=False)


# -------------------------
# Payment Model
# -------------------------
class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(Integer, nullable=False)
    student_name = Column(String, nullable=False)
    roll_number = Column(String, nullable=False)
    student_class = Column(String, nullable=False)

    amount = Column(Float, nullable=False)

    payment_mode = Column(String, nullable=False)
    reference_number = Column(String, nullable=True)

    receipt_number = Column(String, unique=True, nullable=False)

    status = Column(String, default="Paid")

    created_at = Column(DateTime, default=datetime.utcnow)
