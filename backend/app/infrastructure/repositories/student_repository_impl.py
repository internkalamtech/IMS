from sqlalchemy.orm import Session
from app.domain.repositories.student_repository import StudentRepository
from app.infrastructure.database.models import StudentModel

class StudentRepositoryImpl(StudentRepository):

    def __init__(self, db: Session):
        self.db = db

    def list_students(self, name=None, student_class=None, route_stop=None):

        query = self.db.query(StudentModel)

        if name:
            query = query.filter(StudentModel.name.contains(name))

        if student_class:
            query = query.filter(StudentModel.student_class == student_class)

        if route_stop:
            query = query.filter(StudentModel.route_stop == route_stop)

        return query.all()

    def update_student_stop(self, student_id, route_stop):

        student = self.db.query(StudentModel).filter(StudentModel.id == student_id).first()

        student.route_stop = route_stop

        self.db.commit()

        return student

    def route_summary(self):

        result = self.db.query(
            StudentModel.route_stop
        ).all()

        summary = {}

        for r in result:
            stop = r.route_stop
            summary[stop] = summary.get(stop, 0) + 1

        return summary
