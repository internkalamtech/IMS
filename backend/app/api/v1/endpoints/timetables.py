from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter()

# Temporary in-memory storage
timetables = []

# Timetable model
class TimetableCreate(BaseModel):
    classId: int
    day: str
    periodNumber: int
    subject: str
    teacher: str
    room: str
    startTime: str
    endTime: str
    type: str = "PERIOD"   # PERIOD / BREAK / FREE PERIOD


# Create timetable
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_timetable(payload: TimetableCreate):

    new_timetable = {
        "id": len(timetables) + 1,
        "classId": payload.classId,
        "day": payload.day,
        "periodNumber": payload.periodNumber,
        "subject": payload.subject,
        "teacher": payload.teacher,
        "room": payload.room,
        "startTime": payload.startTime,
        "endTime": payload.endTime,
        "type": payload.type,
        "isDeleted": False
    }

    timetables.append(new_timetable)

    return new_timetable


# Get all timetables
@router.get("/")
def get_timetables():
    return [t for t in timetables if not t["isDeleted"]]


# Update timetable
@router.put("/{timetable_id}")
def update_timetable(timetable_id: int, payload: TimetableCreate):

    for t in timetables:
        if t["id"] == timetable_id and not t["isDeleted"]:
            t.update(payload.dict())
            return t

    raise HTTPException(status_code=404, detail="Timetable not found")


# Soft delete timetable
@router.delete("/{timetable_id}")
def delete_timetable(timetable_id: int):

    for t in timetables:
        if t["id"] == timetable_id:
            t["isDeleted"] = True
            return {"message": "Timetable deleted successfully"}

    raise HTTPException(status_code=404, detail="Timetable not found")