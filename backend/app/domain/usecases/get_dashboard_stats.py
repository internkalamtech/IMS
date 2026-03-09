from app.infrastructure.repositories.dashboard_repository import DashboardRepository


class GetDashboardStats:

    def __init__(self, repo: DashboardRepository):
        self.repo = repo

    async def execute(self):
        students = await self.repo.get_total_students()
        teachers = await self.repo.get_total_teachers()

        return {
            "stats": [
                {"label": "Total Students", "value": str(students)},
                {"label": "Total Teachers", "value": str(teachers)},
            ]
        }
