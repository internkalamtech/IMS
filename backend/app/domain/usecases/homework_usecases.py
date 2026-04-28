"""
Use case for academic summary business logic.

Use cases encapsulate business rules and orchestrate the flow of data
between entities and repositories.
"""

from app.domain.repositories.homework_repository import HomeworkRepository


class GetPendingHomeworkCountUseCase:
    """
    Use case for retrieving the count of pending homework for a child.

    This use case handles the business logic for aggregating pending
    homework tasks for a given childId.
    """

    def __init__(self, homework_repository: HomeworkRepository):
        """
        Initialize the use case.

        Args:
            homework_repository: Repository for homework data operations
        """
        self.homework_repository = homework_repository

    async def execute(self, child_id: str) -> int:
        """
        Execute the use case.

        Args:
            child_id: ID of the student (child) whose homework to aggregate

        Returns:
            Integer count of pending homework assignments

        Raises:
            ValueError: If child_id is empty or invalid
        """
        if not child_id or not child_id.strip():
            raise ValueError("childId is required")

        return await self.homework_repository.get_pending_homework_count(
            child_id.strip()
        )
