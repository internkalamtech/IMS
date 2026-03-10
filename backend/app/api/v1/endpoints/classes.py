from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# temporary storage
classes = []

# schema
class ClassCreate(BaseModel):
    name: str
    section: str


# CREATE
@router.post("/classes")
def create_class(class_data: ClassCreate):
    new_class = {
        "id": len(classes) + 1,
        "name": class_data.name,
        "section": class_data.section
    }

    classes.append(new_class)

    return {
        "message": "Class created",
        "data": new_class
    }


# FETCH
@router.get("/classes")
def get_classes():
    return classes


# UPDATE
@router.put("/classes/{class_id}")
def update_class(class_id: int, class_data: ClassCreate):

    for cls in classes:
        if cls["id"] == class_id:
            cls["name"] = class_data.name
            cls["section"] = class_data.section
            return {
                "message": "Class updated",
                "data": cls
            }

    raise HTTPException(status_code=404, detail="Class not found")


# DELETE
@router.delete("/classes/{class_id}")
def delete_class(class_id: int):

    for cls in classes:
        if cls["id"] == class_id:
            classes.remove(cls)
            return {
                "message": "Class deleted"
            }

    raise HTTPException(status_code=404, detail="Class not found")