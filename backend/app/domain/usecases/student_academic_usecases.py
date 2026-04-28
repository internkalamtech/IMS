"""
Use cases for Student Academic Data.

Contains business logic for retrieving student-specific academic data
with proper validation and error handling.

Following Clean Architecture principles:
- Encapsulates business logic
- Validates inputs
- Handles errors gracefully
- Coordinates between repositories and domain entities
"""

from app.core.errors import ValidationError, NotFoundError
from app.core.logger import Logger
from app.infrastructure.repositories.student_academic_repository import (
    StudentAcademicRepository,
)


class GetStudentTimetableUseCase:
    """
    Use case for retrieving student's timetable.

    Ensures that:
    1. Student exists in the database
    2. Student belongs to a valid class
    3. Timetable data is scoped to their class only
    """

    def __init__(self, repository: StudentAcademicRepository):
        """
        Initialize use case with repository.

        Args:
            repository: StudentAcademicRepository instance
        """
        self.repository = repository

    async def execute(self, student_id: int) -> dict:
        """
        Get timetable for a specific student.

        Args:
            student_id: Student ID from database

        Returns:
            Dictionary containing:
            - timetable: List of timetable entries
            - class_id: Student's class ID
            - class_name: Student's class name
            - student_id: Student ID

        Raises:
            ValidationError: If student_id is invalid
            NotFoundError: If student not found
        """
        # Validate input
        if not student_id or student_id <= 0:
            Logger.warning(f"Invalid student_id provided: {student_id}")
            raise ValidationError("Invalid student ID")

        Logger.info(f"GetStudentTimetableUseCase.execute() called for student: {student_id}")

        try:
            # Fetch timetable from repository
            result = await self.repository.get_student_timetable(student_id)

            Logger.info(
                f"Timetable retrieved for student {student_id}: "
                f"class {result['class_id']}"
            )

            return result

        except ValidationError:
            raise
        except NotFoundError:
            raise
        except Exception as e:
            Logger.error(
                f"Unexpected error in GetStudentTimetableUseCase: {e}",
                exc_info=True,
            )
            raise


class GetStudentHomeworkAndMaterialsUseCase:
    """
    Use case for retrieving student's homework and learning materials.

    Ensures that:
    1. Student exists in the database
    2. Homework is filtered by student's class
    3. Materials are filtered by student's enrolled subjects
    4. Data is strictly scoped to the authenticated student
    """

    def __init__(self, repository: StudentAcademicRepository):
        """
        Initialize use case with repository.

        Args:
            repository: StudentAcademicRepository instance
        """
        self.repository = repository

    async def execute(self, student_id: int) -> dict:
        """
        Get homework and materials for a specific student.

        Args:
            student_id: Student ID from database

        Returns:
            Dictionary containing:
            - homework: List of homework assignments
            - materials: List of learning materials
            - class_id: Student's class ID
            - student_id: Student ID
            - subjects: List of subjects for student's class

        Raises:
            ValidationError: If student_id is invalid
            NotFoundError: If student not found
        """
        # Validate input
        if not student_id or student_id <= 0:
            Logger.warning(f"Invalid student_id provided: {student_id}")
            raise ValidationError("Invalid student ID")

        Logger.info(
            f"GetStudentHomeworkAndMaterialsUseCase.execute() called "
            f"for student: {student_id}"
        )

        try:
            # Fetch homework and materials from repository
            result = await self.repository.get_student_homework_and_materials(
                student_id
            )

            Logger.info(
                f"Homework and materials retrieved for student {student_id}: "
                f"{len(result['homework'])} homework, "
                f"{len(result['materials'])} materials"
            )

            return result

        except ValidationError:
            raise
        except NotFoundError:
            raise
        except Exception as e:
            Logger.error(
                f"Unexpected error in GetStudentHomeworkAndMaterialsUseCase: {e}",
                exc_info=True,
            )
            raise
