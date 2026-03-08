from app.domain.repositories.student_repository import StudentRepository

class RouteSummaryUseCase:

    def __init__(self, repo: StudentRepository):
        self.repo = repo

    def execute(self):
        return self.repo.route_summary()
