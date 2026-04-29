"""
Repository for Student Academic Data.

Provides data access methods for retrieving student-specific academic data
including timetables, homework, and learning materials.

Following Clean Architecture principles:
- Implements domain repository interface
- Uses infrastructure layer (database models)
- Handles data mapping and filtering
- Proper error handling and logging
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import DatabaseError, NotFoundError
from app.core.logger import Logger
from app.infrastructure.database.models import (
    StudentModel,
    HomeworkModel,
    ClassSectionModel,
)


class StudentAcademicRepository:
    """
    Repository for student academic data access.

    Provides methods to retrieve timetables, homework, and materials
    specific to an authenticated student.
    """

    def __init__(self, db: AsyncSession):
        """
        Initialize repository with database session.

        Args:
            db: SQLAlchemy async session
        """
        self.db = db

    async def get_student_by_user_id(self, user_id: str) -> StudentModel | None:
        """
        Retrieve student record by user ID.

        Args:
            user_id: User ID from authenticated JWT token

        Returns:
            StudentModel if found, None otherwise

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            result = await self.db.execute(
                select(StudentModel).where(StudentModel.id == int(user_id))
            )
            return result.scalar_one_or_none()
        except ValueError:
            # Invalid user_id format
            return None
        except Exception as e:
            Logger.error(f"Database error fetching student by user_id: {e}")
            raise DatabaseError(f"Failed to fetch student: {str(e)}")

    async def get_student_timetable(self, student_id: int) -> dict:
        """
        Retrieve timetable for a student based on their class.

        Args:
            student_id: Student ID

        Returns:
            Dictionary with timetable data and class information

        Raises:
            NotFoundError: If student not found
            DatabaseError: If database operation fails
        """
        try:
            # Get student record
            result = await self.db.execute(
                select(StudentModel).where(StudentModel.id == student_id)
            )
            student = result.scalar_one_or_none()

            if not student:
                Logger.warning(f"Student not found: {student_id}")
                raise NotFoundError("Student not found")

            class_id = student.class_id
            class_name = student.class_name

            Logger.info(
                f"Fetching timetable for student {student_id} "
                f"in class {class_id}"
            )

            # NOTE: When Timetable model is created and database table is set up,
            # the following query should be uncommented and used:
            # result = await self.db.execute(
            #     select(TimetableModel).where(TimetableModel.class_id == class_id)
            # )
            # timetable_entries = result.scalars().all()

            # For now, return empty list (structure is ready for future timetable table)
            timetable_entries = []

            return {
                "timetable": timetable_entries,
                "class_id": class_id,
                "class_name": class_name,
                "student_id": student_id,
            }

        except NotFoundError:
            raise
        except Exception as e:
            Logger.error(f"Database error fetching timetable: {e}", exc_info=True)
            raise DatabaseError(f"Failed to fetch timetable: {str(e)}")

    async def get_student_homework_and_materials(
        self, student_id: int
    ) -> dict:
        """
        Retrieve homework and materials for a student based on their class
        and enrolled subjects.

        Args:
            student_id: Student ID

        Returns:
            Dictionary with homework and materials lists

        Raises:
            NotFoundError: If student not found
            DatabaseError: If database operation fails
        """
        try:
            # Get student record with class information
            result = await self.db.execute(
                select(StudentModel).where(StudentModel.id == student_id)
            )
            student = result.scalar_one_or_none()

            if not student:
                Logger.warning(f"Student not found: {student_id}")
                raise NotFoundError("Student not found")

            class_id = student.class_id
            class_name = student.class_name

            Logger.info(
                f"Fetching homework and materials for student {student_id} "
                f"in class {class_name}"
            )

            # Get homework for student's class
            homework_result = await self.db.execute(
                select(HomeworkModel).where(HomeworkModel.className == class_name)
            )
            homework_entries = homework_result.scalars().all()

            # Convert homework model to dict format
            homework_list = [
                {
                    "id": hw.id,
                    "title": hw.title,
                    "description": hw.description,
                    "subject": hw.subject,
                    "className": hw.className,
                    "dueDate": hw.dueDate,
                    "assignType": hw.assignType,
                    "created_at": hw.created_at,
                }
                for hw in homework_entries
            ]

            # Get student's class to retrieve subjects
            if class_id:
                class_result = await self.db.execute(
                    select(ClassSectionModel).where(
                        ClassSectionModel.id == class_id
                    )
                )
                class_section = class_result.scalar_one_or_none()

                # Get subjects for this class
                subjects = []
                if class_section and class_section.subjects:
                    subjects = [{"id": s.id, "name": s.name} for s in class_section.subjects]

                Logger.info(
                    f"Found {len(subjects)} subjects for class {class_id}"
                )
            else:
                subjects = []

            # NOTE: When Materials model is created and database table is set up,
            # the following query should be uncommented and used:
            # if subjects:
            #     subject_ids = [s["id"] for s in subjects]
            #     materials_result = await self.db.execute(
            #         select(MaterialModel).where(
            #             MaterialModel.subject_id.in_(subject_ids)
            #         )
            #     )
            #     materials_entries = materials_result.scalars().all()
            # else:
            #     materials_entries = []

            # For now, return empty list (structure is ready for future materials table)
            materials_list = []

            return {
                "homework": homework_list,
                "materials": materials_list,
                "class_id": class_id,
                "student_id": student_id,
                "subjects": subjects,
            }

        except NotFoundError:
            raise
        except Exception as e:
            Logger.error(
                f"Database error fetching homework and materials: {e}",
                exc_info=True,
            )
            raise DatabaseError(f"Failed to fetch homework and materials: {str(e)}")
