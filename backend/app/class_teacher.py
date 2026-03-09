from fastapi import APIRouter

router = APIRouter()

# temporary storage
class_teacher_db = {}


@router.post("/assign-class-teacher")
def assign_class_teacher(teacher_id: str, section: str):

    class_teacher_db[section] = teacher_id

    return {
        "message": "Class Teacher Assigned",
        "teacher_id": teacher_id,
        "section": section
    }
