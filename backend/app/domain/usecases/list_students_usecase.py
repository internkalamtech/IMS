from typing import List
from sqlalchemy.orm import Session
from app.infrastructure.database.models import StudentModel


class ListStudentsUseCase:

    def __init__(self, db: Session):
        self.db = db

    def execute(self, name: str = None, student_class: str = None, route_stop: str = None) -> List[StudentModel]:

        query = self.db.query(StudentModel)

        if name:
            query = query.filter(StudentModel.name.ilike(f"%{name}%"))

        if student_class:
            query = query.filter(StudentModel.student_class == student_class)

        if route_stop:
            query = query.filter(StudentModel.route_stop == route_stop)

        return query.all()
