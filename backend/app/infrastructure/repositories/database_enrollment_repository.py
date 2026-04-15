"""
Database implementations for Student and Parent repositories.

Provides concrete implementations of enrollment repositories using SQLAlchemy.
"""

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert

from app.core.errors import ValidationError, DatabaseError
from app.core.logger import Logger
from app.domain.entities.parent import Parent
from app.domain.entities.payment import Student
from app.domain.repositories.enrollment_repository import (
    ParentRepository,
    EnrollmentRepository,
)
from app.infrastructure.database.models import (
    StudentModel,
    ParentModel,
    ClassSectionModel,
    student_parent_link,
)


class DatabaseParentRepository(ParentRepository):
    """
    Database implementation of ParentRepository using SQLAlchemy.
    """

    def __init__(self, db: AsyncSession):
        """
        Initialize the repository.

        Args:
            db: SQLAlchemy async session
        """
        self.db = db

    async def get_parent_by_id(self, parent_id: int) -> Optional[Parent]:
        """
        Retrieve a parent by their ID.

        Args:
            parent_id: Unique identifier of the parent

        Returns:
            Parent entity if found, None otherwise
        """
        try:
            result = await self.db.execute(
                select(ParentModel).where(ParentModel.id == parent_id)
            )
            parent_model = result.scalars().first()
            if parent_model:
                return self._map_to_parent_entity(parent_model)
            return None
        except Exception as e:
            Logger.error(f"Error retrieving parent {parent_id}: {str(e)}")
            raise DatabaseError(f"Failed to retrieve parent: {str(e)}")

    async def get_parent_by_email(self, email: str) -> Optional[Parent]:
        """
        Retrieve a parent by their email.

        Args:
            email: Parent's email address

        Returns:
            Parent entity if found, None otherwise
        """
        try:
            result = await self.db.execute(
                select(ParentModel).where(ParentModel.email == email)
            )
            parent_model = result.scalars().first()
            if parent_model:
                return self._map_to_parent_entity(parent_model)
            return None
        except Exception as e:
            Logger.error(f"Error retrieving parent by email {email}: {str(e)}")
            raise DatabaseError(f"Failed to retrieve parent: {str(e)}")

    async def create_parent(
        self,
        name: str,
        phone: str,
        email: str,
        relationship_type: str,
    ) -> Parent:
        """
        Create a new parent record.

        Args:
            name: Parent's full name
            phone: Contact phone number
            email: Email address
            relationship_type: Relationship to student

        Returns:
            Created Parent entity

        Raises:
            ValidationError: If required fields are invalid
            DatabaseError: If parent with same email already exists
        """
        try:
            # Check if parent with same email already exists
            existing = await self.get_parent_by_email(email)
            if existing:
                raise ValidationError(
                    f"Parent with email '{email}' already exists"
                )

            parent_model = ParentModel(
                name=name,
                phone=phone,
                email=email,
                relationship_type=relationship_type,
                is_active=True,
            )
            self.db.add(parent_model)
            await self.db.flush()  # Get the ID without committing

            Logger.info(f"Created parent {parent_model.id} with email {email}")
            return self._map_to_parent_entity(parent_model)
        except ValidationError:
            raise
        except Exception as e:
            Logger.error(f"Error creating parent: {str(e)}")
            raise DatabaseError(f"Failed to create parent: {str(e)}")

    async def link_student_to_parent(
        self, student_id: int, parent_id: int
    ) -> None:
        """
        Create a relationship between a student and parent.

        Args:
            student_id: ID of the student
            parent_id: ID of the parent

        Raises:
            ValidationError: If student or parent doesn't exist
            DatabaseError: If link already exists or database error
        """
        try:
            # Verify student exists
            student_result = await self.db.execute(
                select(StudentModel).where(StudentModel.id == student_id)
            )
            student_model = student_result.scalars().first()
            if not student_model:
                raise ValidationError(
                    f"Student with ID {student_id}"
                    " does not exist"
                )

            # Verify parent exists
            parent_result = await self.db.execute(
                select(ParentModel).where(ParentModel.id == parent_id)
            )
            parent_model = parent_result.scalars().first()
            if not parent_model:
                raise ValidationError(
                    f"Parent with ID {parent_id}"
                    " does not exist"
                )

            # Check if link already exists
            existing_link = await self.db.execute(
                select(student_parent_link).where(
                    (student_parent_link.c.student_id == student_id)
                    & (student_parent_link.c.parent_id == parent_id)
                )
            )
            if existing_link.first():
                Logger.warning(
                    f"Link between student {student_id}"
                    f" and parent {parent_id} "
                    "already exists"
                )
                return  # Already linked, no need to link again

            # Create the link by inserting into the student_parent_link table
            await self.db.execute(
                insert(student_parent_link).values(
                    student_id=student_id,
                    parent_id=parent_id
                )
            )
            await self.db.flush()

            Logger.info(f"Linked student {student_id} with parent {parent_id}")
        except ValidationError:
            raise
        except Exception as e:
            Logger.error(
                f"Error linking student {student_id}"
                f" with parent {parent_id}: {str(e)}"
            )
            raise DatabaseError(f"Failed to link student and parent: {str(e)}")

    async def get_students_for_parent(self, parent_id: int) -> List[Student]:
        """
        Get all students linked to a parent.

        Args:
            parent_id: ID of the parent

        Returns:
            List of Student entities linked to the parent
        """
        try:
            result = await self.db.execute(
                select(ParentModel).where(ParentModel.id == parent_id)
            )
            parent_model = result.scalars().first()
            if not parent_model:
                return []

            return [
                self._map_student_model_to_entity(student)
                for student in parent_model.students
            ]
        except Exception as e:
            Logger.error(
                "Error retrieving students"
                f" for parent {parent_id}: {str(e)}"
            )
            raise DatabaseError(f"Failed to retrieve students: {str(e)}")

    @staticmethod
    def _map_to_parent_entity(parent_model: ParentModel) -> Parent:
        """Map ParentModel to Parent entity."""
        return Parent(
            id=parent_model.id,
            user_id=parent_model.user_id,
            name=parent_model.name,
            phone=parent_model.phone,
            email=parent_model.email,
            relationship_type=parent_model.relationship_type,
            is_active=parent_model.is_active,
            created_at=parent_model.created_at,
            updated_at=parent_model.updated_at,
        )

    @staticmethod
    def _map_student_model_to_entity(student_model: StudentModel) -> Student:
        """Map StudentModel to Student entity."""
        return Student(
            id=student_model.id,
            name=student_model.name,
            roll_number=student_model.roll_number,
            class_name=student_model.class_name,
            next_due_date=student_model.next_due_date,
        )


class DatabaseEnrollmentRepository(EnrollmentRepository):
    """
    Database implementation of EnrollmentRepository using SQLAlchemy.
    """

    def __init__(self, db: AsyncSession):
        """
        Initialize the repository.

        Args:
            db: SQLAlchemy async session
        """
        self.db = db

    async def create_student(
        self,
        name: str,
        roll_number: str,
        class_id: int,
        class_name: str,
    ) -> Student:
        """
        Create a new student record.

        Args:
            name: Student's full name
            roll_number: Unique roll number
            class_id: ID of the class section
            class_name: Name of the class

        Returns:
            Created Student entity

        Raises:
            ValidationError: If required fields are invalid
            DatabaseError: If roll_number already exists
        """
        try:
            # Check if roll number already exists
            existing = await self.get_student_by_roll_number(roll_number)
            if existing:
                raise ValidationError(
                    f"Student with roll number '{roll_number}' already exists"
                )

            student_model = StudentModel(
                name=name,
                roll_number=roll_number,
                class_id=class_id,
                class_name=class_name,
            )
            self.db.add(student_model)
            await self.db.flush()  # Get the ID without committing

            Logger.info(
                f"Created student {student_model.id}"
                f" with roll {roll_number}"
            )
            return self._map_to_student_entity(student_model)
        except ValidationError:
            raise
        except Exception as e:
            Logger.error(f"Error creating student: {str(e)}")
            raise DatabaseError(f"Failed to create student: {str(e)}")

    async def get_student_by_id(self, student_id: int) -> Optional[Student]:
        """
        Retrieve a student by their ID.

        Args:
            student_id: Unique identifier of the student

        Returns:
            Student entity if found, None otherwise
        """
        try:
            result = await self.db.execute(
                select(StudentModel).where(StudentModel.id == student_id)
            )
            student_model = result.scalars().first()
            if student_model:
                return self._map_to_student_entity(student_model)
            return None
        except Exception as e:
            Logger.error(f"Error retrieving student {student_id}: {str(e)}")
            raise DatabaseError(f"Failed to retrieve student: {str(e)}")

    async def get_student_by_roll_number(
        self, roll_number: str
    ) -> Optional[Student]:
        """
        Retrieve a student by their roll number.

        Args:
            roll_number: Student's roll number

        Returns:
            Student entity if found, None otherwise
        """
        try:
            result = await self.db.execute(
                select(StudentModel).where(
                    StudentModel.roll_number == roll_number
                )
            )
            student_model = result.scalars().first()
            if student_model:
                return self._map_to_student_entity(student_model)
            return None
        except Exception as e:
            Logger.error(
                "Error retrieving student"
                f" by roll number {roll_number}: {str(e)}"
            )
            raise DatabaseError(f"Failed to retrieve student: {str(e)}")

    async def validate_class_exists(self, class_id: int) -> bool:
        """
        Validate that a class section exists.

        Args:
            class_id: ID of the class to validate

        Returns:
            True if class exists, False otherwise
        """
        try:
            result = await self.db.execute(
                select(ClassSectionModel).where(
                    ClassSectionModel.id == class_id
                )
            )
            return result.scalars().first() is not None
        except Exception as e:
            Logger.error(f"Error validating class {class_id}: {str(e)}")
            raise DatabaseError(f"Failed to validate class: {str(e)}")

    @staticmethod
    def _map_to_student_entity(student_model: StudentModel) -> Student:
        """Map StudentModel to Student entity."""
        return Student(
            id=student_model.id,
            name=student_model.name,
            roll_number=student_model.roll_number,
            class_name=student_model.class_name,
            next_due_date=student_model.next_due_date,
            created_at=student_model.created_at,
            updated_at=student_model.updated_at,
        )
