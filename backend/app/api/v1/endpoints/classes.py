from fastapi import APIRouter, HTTPException, status
from typing import Optional
from pydantic import BaseModel

router = APIRouter()

# Temporary storage (until database is connected)
classes = []

class ClassCreate(BaseModel):
    name: str
    section: str
    academicPeriodId: int
    
    # Optional teacher field
    teacher: str = ""

    # Optional subject field
    subject: str = ""

# ---------------------------
# CREATE CLASS
# ---------------------------
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_class(payload: ClassCreate):

    # Check duplicate name + section
    for cls in classes:
        if cls["name"] == payload.name and cls["section"] == payload.section and not cls["isDeleted"]:
            raise HTTPException(
                status_code=400,
                detail="Class with same Name and Section already exists"
            )

    new_class = {
        "id": len(classes) + 1,
        "name": payload.name,
        "section": payload.section,
        "academicPeriodId": payload.academicPeriodId,
         # Optional teacher field
        "teacher":teacher,
        # Optional subject field
        "subject": subject,
        "totalStudents": 0,
        "isDeleted": False
        }

    classes.append(new_class)

    return new_class


# ---------------------------
# FETCH CLASSES
# ---------------------------
@router.get("/")
def get_classes(academicPeriodId: Optional[int] = None):

    if academicPeriodId is None:
        return classes

    return [cls for cls in classes if cls["academicPeriodId"] == academicPeriodId]

# ---------------------------
# UPDATE CLASS
# ---------------------------
@router.put("/{class_id}")
def update_class(class_id: int, payload: ClassCreate):

    # Check duplicate name + section excluding current class
    for cls in classes:
        if (
            cls["id"] != class_id and
            cls["name"] == payload.name and
            cls["section"] == payload.section and
            not cls["isDeleted"]
        ):
            raise HTTPException(
                status_code=400,
                detail="Another class with same Name and Section exists"
            )

    # Find class and update values
    for cls in classes:
        if cls["id"] == class_id and not cls["isDeleted"]:

            # Update fields
            cls["name"] = payload.name
            cls["section"] = payload.section
            cls["academicPeriodId"] = payload.academicPeriodId

            return cls

    # If class not found
    raise HTTPException(
        status_code=404,
        detail="Class not found"
    )

# ---------------------------
# DELETE CLASS (SOFT DELETE)
# ---------------------------
@router.delete("/classes/{class_id}")
def delete_class(class_id: int):

    for cls in classes:

        if cls["id"] == class_id:

            # Example check for enrolled students
            if cls["totalStudents"] > 0:
                raise HTTPException(
                    status_code=409,
                    detail="Cannot delete class with active students"
                )

            else:
                cls["isDeleted"] = True

                # Simple log simulation
                print(f"Class {class_id} soft deleted")

            return {"message": "Class deleted successfully"}

    raise HTTPException(status_code=404, detail="Class not found")