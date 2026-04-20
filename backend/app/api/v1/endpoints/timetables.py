from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# 🔹 Temporary in-memory storage
timetables = []


# 🔹 Timetable model (Request Body)
class TimetableCreate(BaseModel):
    classId: int
    day: str
    periodNumber: int
    subject: str
    teacher: str
    room: str
    startTime: str
    endTime: str
    type: str = "PERIOD"  # PERIOD / BREAK / FREE PERIOD


# 🔥 CREATE TIMETABLE (WITH VALIDATION)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_timetable(payload: TimetableCreate):

    # 🔴 1. Check duplicate period in same class + day
    for t in timetables:
        if (
            not t["isDeleted"]
            and t["classId"] == payload.classId
            and t["day"] == payload.day
            and t["periodNumber"] == payload.periodNumber
        ):
            raise HTTPException(
                status_code=400,
                detail="Period already exists for this class on this day",
            )

    # 🔴 2. Teacher conflict (same time)
    for t in timetables:
        if (
            not t["isDeleted"]
            and t["day"] == payload.day
            and t["startTime"] == payload.startTime
            and t["teacher"] == payload.teacher
        ):
            raise HTTPException(
                status_code=400,
                detail="Teacher already assigned at this time",
            )

    # 🔴 3. Room conflict
    for t in timetables:
        if (
            not t["isDeleted"]
            and t["day"] == payload.day
            and t["startTime"] == payload.startTime
            and t["room"] == payload.room
        ):
            raise HTTPException(
                status_code=400,
                detail="Room already occupied at this time",
            )

    # ✅ Create timetable entry
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
        "isDeleted": False,
    }

    timetables.append(new_timetable)

    return new_timetable


# 🔥 GET TIMETABLES (FILTER BY CLASS + DAY)
@router.get("/")
def get_timetables(
    class_id: Optional[int] = Query(None),
    day: Optional[str] = Query(None),
):
    result = [t for t in timetables if not t["isDeleted"]]

    # ✅ Filter by class
    if class_id is not None:
        result = [t for t in result if t["classId"] == class_id]

    # ✅ Filter by day
    if day is not None:
        result = [t for t in result if t["day"] == day]

    return result


# 🔥 UPDATE TIMETABLE
@router.put("/{timetable_id}")
def update_timetable(timetable_id: int, payload: TimetableCreate):

    for t in timetables:
        if t["id"] == timetable_id and not t["isDeleted"]:

            # 🔴 Prevent duplicate period on update
            for other in timetables:
                if (
                    other["id"] != timetable_id
                    and not other["isDeleted"]
                    and other["classId"] == payload.classId
                    and other["day"] == payload.day
                    and other["periodNumber"] == payload.periodNumber
                ):
                    raise HTTPException(
                        status_code=400,
                        detail="Period already exists for this class on this day",
                    )

            t.update(payload.dict())
            return t

    raise HTTPException(status_code=404, detail="Timetable not found")


# 🔥 DELETE (SOFT DELETE)
@router.delete("/{timetable_id}")
def delete_timetable(timetable_id: int):

    for t in timetables:
        if t["id"] == timetable_id and not t["isDeleted"]:
            t["isDeleted"] = True
            return {"message": "Timetable deleted successfully"}

    raise HTTPException(status_code=404, detail="Timetable not found")