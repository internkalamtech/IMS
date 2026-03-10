from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

classes = []

# Schema
class ClassCreate(BaseModel):
    name: str
    section: str


# Create Class
@router.post("/classes")
def create_class(class_data: ClassCreate):
    new_class = {
        "name": class_data.name,
        "section": class_data.section
    }

    classes.append(new_class)

    return {
        "message": "Class created",
        "data": new_class
    }


# Fetch Classes
@router.get("/classes")
def get_classes():
    return classes