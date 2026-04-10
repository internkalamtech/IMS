from datetime import timedelta, datetime, time
from collections import defaultdict
from app.infrastructure.repositories import database_teacher_repository


# -------------------------
# SAFE HELPERS
# -------------------------
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


# -------------------------
# MAIN FUNCTION
# -------------------------
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

    # -------------------------
    # FILTER SAFE PERIODS
    # -------------------------
    safe_periods = [
        p for p in periods
        if getattr(p, "start_time", None)
        and getattr(p, "end_time", None)
    ]

    # -------------------------
    # WORKING DAY CONFIG
    # -------------------------
    start_day = datetime.combine(date_value, time(9, 0))
    end_day = datetime.combine(date_value, time(17, 0))

    break_start = datetime.combine(date_value, time(13, 0))
    break_end = datetime.combine(date_value, time(14, 0))

    # -------------------------
    # DAY VIEW (FINAL FIXED)
    # -------------------------
    if view == "day":

        filtered_periods = [
            p for p in safe_periods
            if safe_date(p.start_time) == date_value
        ]

        filtered_periods.sort(key=lambda p: p.start_time)

        result = []
        current_time = start_day
        break_added = False

        for p in filtered_periods:

            # -------------------------
            # HANDLE BREAK
            # -------------------------
            if not break_added and current_time < break_end:

                if current_time < break_start < p.start_time:

                    if current_time < break_start:
                        result.append({
                            "type": "free",
                            "start_time": safe_datetime(current_time),
                            "end_time": safe_datetime(break_start),
                        })

                    result.append({
                        "type": "break",
                        "start_time": safe_datetime(break_start),
                        "end_time": safe_datetime(break_end),
                    })

                    current_time = break_end
                    break_added = True

            # -------------------------
            # FREE SLOT BEFORE CLASS
            # -------------------------
            if current_time < p.start_time:

                result.append({
                    "type": "free",
                    "start_time": safe_datetime(current_time),
                    "end_time": safe_datetime(p.start_time),
                })

            # -------------------------
            # CLASS ENTRY
            # -------------------------
            class_obj = getattr(p, "class_", None)
            class_name = (
                getattr(class_obj, "name", None)
                if class_obj else None
            )

            result.append({
                "id": getattr(p, "id", None),
                "teacher_id": getattr(p, "teacher_id", None),
                "subject": getattr(p, "subject", None),
                "class": class_name,
                "room": getattr(p, "room_type", None),
                "start_time": safe_datetime(p.start_time),
                "end_time": safe_datetime(p.end_time),
                "type": "regular",
            })

            current_time = max(current_time, p.end_time)

        # -------------------------
        # FINAL FREE SLOT
        # -------------------------
        if current_time < end_day:
            result.append({
                "type": "free",
                "start_time": safe_datetime(current_time),
                "end_time": safe_datetime(end_day),
            })

        return {
            "teacher_id": teacher_id,
            "view": view,
            "date": date_value.isoformat(),
            "periods": result,
        }

    # -------------------------
    # WEEK VIEW
    # -------------------------
    elif view == "week":

        start_of_week = date_value - timedelta(
            days=date_value.weekday()
        )

        week_map = defaultdict(list)

        for p in safe_periods:

            p_date = safe_date(p.start_time)

            if start_of_week <= p_date <= (
                start_of_week + timedelta(days=6)
            ):

                class_obj = getattr(p, "class_", None)
                class_name = (
                    getattr(class_obj, "name", None)
                    if class_obj else None
                )

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

            day_periods = week_map.get(day_str, [])

            result.append({
                "date": day_str,
                "periods": sorted(
                    day_periods,
                    key=lambda x: x["start_time"] or "",
                ),
            })

        return {
            "teacher_id": teacher_id,
            "view": view,
            "date": date_value.isoformat(),
            "periods": result,
        }

    # -------------------------
    # INVALID VIEW
    # -------------------------
    return {
        "teacher_id": teacher_id,
        "view": view,
        "date": date_value.isoformat(),
        "periods": [],
    }
