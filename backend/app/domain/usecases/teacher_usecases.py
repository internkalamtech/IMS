from app.infrastructure.repositories import database_teacher_repository

async def get_teacher_timetable(db, teacher_id):
    return await database_teacher_repository.get_timetable_by_teacher(db, teacher_id)

async def get_peer_teachers(db, teacher_id: int):
    return await database_teacher_repository.get_peer_teachers(db, teacher_id)