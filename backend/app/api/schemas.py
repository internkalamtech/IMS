# =========================
# IMPORTS (FIXED)
# =========================

from pydantic import BaseModel, Field, EmailStr
from typing import Optional


# =========================
# ENROLLMENT
# =========================

class ParentInput(BaseModel):
    name: str
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    relationship_type: str = "Parent"


class StudentInput(BaseModel):
    name: str
    roll_number: str = Field(..., min_length=1)
    class_id: int
    class_name: str


class CreateStudentWithParentRequest(BaseModel):
    student: StudentInput
    parent: ParentInput
    link_existing_parent: bool = False


class StudentResponse(BaseModel):
    id: int
    name: str
    roll_number: str
    class_id: int
    class_name: str

    model_config = {"from_attributes": True}


class ParentResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    relationship_type: str

    model_config = {"from_attributes": True}


class CreateStudentWithParentResponse(BaseModel):
    student: StudentResponse
    parent: ParentResponse
    message: str