from datetime import timedelta, datetime, time
from collections import defaultdict
from app.infrastructure.repositories import database_teacher_repository


def safe_datetime(dt):
    if isinstance(dt, datetime):
        return dt.isoformat()
    return None


def safe_date(dt):
    if isinstance(dt, datetime):
        return dt.date()
    return dt


def ensure_date(date_value):
    if isinstance(date_value, str):
        return datetime.fromisoformat(date_value).date()
    return date_value


async def get_teacher_timetable(db, teacher_id, view, date_value):

    date_value = ensure_date(date_value)

    periods = await database_teacher_repository.get_teacher_timetable(
        db,
        teacher_id,
    )

    if not periods:
        return {
            "teacher_id": teacher_id,
            "view": view,
            "date": date_value.isoformat(),
            "periods": [],
        }

    safe_periods = [
        p for p in periods
        if getattr(p, "start_time", None)
        and getattr(p, "end_time", None)
    ]

    start_day = datetime.combine(date_value, time(9, 0))
    end_day = datetime.combine(date_value, time(17, 0))

    break_start = datetime.combine(date_value, time(13, 0))
    break_end = datetime.combine(date_value, time(14, 0))

    if view == "day":

        events = []

        for p in safe_periods:
            if safe_date(p.start_time) == date_value:
                class_obj = getattr(p, "class_", None)
                class_name = getattr(class_obj, "name", None) if class_obj else None

                events.append({
                    "type": "regular",
                    "start": p.start_time,
                    "end": p.end_time,
                    "data": {
                        "id": getattr(p, "id", None),
                        "teacher_id": getattr(p, "teacher_id", None),
                        "subject": getattr(p, "subject", None),
                        "class": class_name,
                        "room": getattr(p, "room_type", None),
                    }
                })

        events.sort(key=lambda x: x["start"])

        result = []
        current_time = start_day

        for event in events:

            if event["end"] <= start_day or event["start"] >= end_day:
                continue

            start = max(event["start"], start_day)
            end = min(event["end"], end_day)

            if current_time < start:

                temp_start = current_time

                if temp_start < break_start:
                    free_end = min(start, break_start)
                    if temp_start < free_end:
                        result.append({
                            "type": "free",
                            "start_time": safe_datetime(temp_start),
                            "end_time": safe_datetime(free_end),
                        })
                    temp_start = free_end

                if temp_start < break_end and start > break_start:
                    result.append({
                        "type": "break",
                        "start_time": safe_datetime(break_start),
                        "end_time": safe_datetime(break_end),
                    })
                    temp_start = break_end

                if temp_start < start:
                    result.append({
                        "type": "free",
                        "start_time": safe_datetime(temp_start),
                        "end_time": safe_datetime(start),
                    })

            result.append({
                **event["data"],
                "start_time": safe_datetime(start),
                "end_time": safe_datetime(end),
                "type": "regular",
            })

            current_time = max(current_time, end)

        if current_time < end_day:

            temp_start = current_time

            if temp_start < break_start:
                free_end = min(end_day, break_start)
                if temp_start < free_end:
                    result.append({
                        "type": "free",
                        "start_time": safe_datetime(temp_start),
                        "end_time": safe_datetime(free_end),
                    })
                temp_start = free_end

            if temp_start < break_end:
                result.append({
                    "type": "break",
                    "start_time": safe_datetime(break_start),
                    "end_time": safe_datetime(break_end),
                })
                temp_start = break_end

            if temp_start < end_day:
                result.append({
                    "type": "free",
                    "start_time": safe_datetime(temp_start),
                    "end_time": safe_datetime(end_day),
                })

        return {
            "teacher_id": teacher_id,
            "view": view,
            "date": date_value.isoformat(),
            "periods": result,
        }

    elif view == "week":

        start_of_week = date_value - timedelta(days=date_value.weekday())
        week_map = defaultdict(list)

        for p in safe_periods:
            p_date = safe_date(p.start_time)

            if start_of_week <= p_date <= start_of_week + timedelta(days=6):

                class_obj = getattr(p, "class_", None)
                class_name = getattr(class_obj, "name", None) if class_obj else None

                week_map[p_date.isoformat()].append({
                    "id": getattr(p, "id", None),
                    "teacher_id": getattr(p, "teacher_id", None),
                    "subject": getattr(p, "subject", None),
                    "class": class_name,
                    "room": getattr(p, "room_type", None),
                    "start_time": safe_datetime(p.start_time),
                    "end_time": safe_datetime(p.end_time),
                    "type": "regular",
                })

        result = []

        for i in range(7):
            day = start_of_week + timedelta(days=i)
            day_str = day.isoformat()

            result.append({
                "date": day_str,
                "periods": sorted(
                    week_map.get(day_str, []),
                    key=lambda x: x["start_time"] or "",
                ),
            })

        return {
            "teacher_id": teacher_id,
            "view": view,
            "date": date_value.isoformat(),
            "periods": result,
        }

    return {
        "teacher_id": teacher_id,
        "view": view,
        "date": date_value.isoformat(),
        "periods": [],
    }


async def get_peer_teachers(db, teacher_id: int):
    return await database_teacher_repository.get_peer_teachers(db, teacher_id)