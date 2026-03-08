from typing import List
from app.domain.entities.student import Student

class StudentRepository:

    def list_students(self, name=None, student_class=None, route_stop=None) -> List[Student]:
        pass

    def update_student_stop(self, student_id: int, route_stop: str):
        pass

    def route_summary(self):
        pass
