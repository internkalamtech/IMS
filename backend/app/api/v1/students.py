from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.domain.usecases.list_students_usecase import ListStudentsUseCase
from app.domain.usecases.update_student_stop_usecase import UpdateStudentStopUseCase
from app.domain.usecases.route_summary_usecase import RouteSummaryUseCase

from app.infrastructure.repositories.student_repository_impl import StudentRepositoryImpl
from app.infrastructure.database.database import get_db

router = APIRouter()


@router.get("/students")
def list_students(name: str = None, student_class: str = None, route_stop: str = None, db: Session = Depends(get_db)):

    repo = StudentRepositoryImpl(db)
    usecase = ListStudentsUseCase(repo)

    return usecase.execute(name, student_class, route_stop)


@router.put("/students/{student_id}")
def update_student_stop(student_id: int, route_stop: str, db: Session = Depends(get_db)):

    repo = StudentRepositoryImpl(db)
    usecase = UpdateStudentStopUseCase(repo)

    return usecase.execute(student_id, route_stop)


@router.get("/routes/summary")
def route_summary(db: Session = Depends(get_db)):

    repo = StudentRepositoryImpl(db)
    usecase = RouteSummaryUseCase(repo)

    return usecase.execute()
