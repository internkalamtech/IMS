from app.domain.repositories.student_repository import StudentRepository

class UpdateStudentStopUseCase:

    def __init__(self, repo: StudentRepository):
        self.repo = repo

    def execute(self, student_id, route_stop):
        return self.repo.update_student_stop(student_id, route_stop)
