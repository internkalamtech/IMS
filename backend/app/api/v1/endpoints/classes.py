from fastapi import APIRouter, HTTPException, status
from typing import Optional

router = APIRouter()

# Temporary storage (until database is connected)
classes = []

# ---------------------------
# CREATE CLASS
# ---------------------------
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_class(name: str, section: str, academicPeriodId: int):

    # Check duplicate name + section
    for cls in classes:
        if cls["name"] == name and cls["section"] == section and not cls["isDeleted"]:
            raise HTTPException(
                status_code=400,
                detail="Class with same Name and Section already exists"
            )

    new_class = {
        "id": len(classes) + 1,
        "name": name,
        "section": section,
        "academicPeriodId": academicPeriodId,
        "totalStudents": 0,
        "isDeleted": False
    }

    classes.append(new_class)

    return new_class


# ---------------------------
# FETCH CLASSES
# ---------------------------
@router.get("/classes")
def get_classes(academicPeriodId: Optional[int] = None):

    if academicPeriodId is None:
        return classes

    return [cls for cls in classes if cls["academicPeriodId"] == academicPeriodId]

# ---------------------------
# UPDATE CLASS
# ---------------------------
@router.put("/classes/{class_id}")
def update_class(class_id: int, name: str, section: str):

    # Check duplicate name + section
    for cls in classes:
        if cls["id"] != class_id and cls["name"] == name and cls["section"] == section and not cls["isDeleted"]:
            raise HTTPException(
                status_code=400,
                detail="Another class with same Name and Section exists"
            )

    for cls in classes:
        if cls["id"] == class_id and not cls["isDeleted"]:
            cls["name"] = name
            cls["section"] = section
            return cls

    raise HTTPException(status_code=404, detail="Class not found")


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