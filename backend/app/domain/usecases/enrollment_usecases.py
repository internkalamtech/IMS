"""
Use cases for student and parent enrollment.

Use cases encapsulate business logic for creating students with parent links.
"""

from typing import Optional

from app.core.errors import ValidationError, DatabaseError
from app.core.logger import Logger
from app.domain.entities.parent import Parent
from app.domain.entities.payment import Student
from app.domain.repositories.enrollment_repository import (
    ParentRepository,
    EnrollmentRepository,
)


class CreateStudentWithParentUseCase:
    """
    Use case for creating a student with parent link.

    Handles the business logic for:
    1. Validating student and parent information
    2. Creating or linking parent
    3. Creating student
    4. Establishing student-parent relationship
    """

    def __init__(
        self,
        enrollment_repo: EnrollmentRepository,
        parent_repo: ParentRepository,
    ):
        """
        Initialize the use case.

        Args:
            enrollment_repo: Repository for student operations
            parent_repo: Repository for parent operations
        """
        self.enrollment_repo = enrollment_repo
        self.parent_repo = parent_repo

    async def execute(
        self,
        student_name: str,
        student_roll_number: str,
        class_id: int,
        class_name: str,
        parent_name: str,
        parent_phone: str,
        parent_email: str,
        parent_relationship_type: str,
        link_existing_parent: bool = False,
    ) -> tuple[Student, Parent]:
        """
        Execute the student and parent creation use case.

        Args:
            student_name: Student's full name
            student_roll_number: Student's unique roll number
            class_id: ID of the class section
            class_name: Name of the class
            parent_name: Parent's full name
            parent_phone: Parent's phone number
            parent_email: Parent's email address
            parent_relationship_type: Relationship to student
            link_existing_parent: If True, link to existing parent

        Returns:
            Tuple of (Student entity, Parent entity)

        Raises:
            ValidationError: If validation fails
            DatabaseError: If database operations fail
        """
        # Step 1: Validate student information
        Logger.info(f"Validating student: {student_name}, Roll: {student_roll_number}")
        self._validate_student_input(
            student_name, student_roll_number, class_id, class_name
        )

        # Step 2: Validate class exists
        class_exists = await self.enrollment_repo.validate_class_exists(class_id)
        if not class_exists:
            raise ValidationError(f"Class with ID {class_id} does not exist")

        # Step 3: Check if student roll number already exists
        existing_student = await self.enrollment_repo.get_student_by_roll_number(
            student_roll_number
        )
        if existing_student:
            raise ValidationError(
                f"Student with roll number '{student_roll_number}' already exists"
            )

        # Step 4: Validate parent information
        Logger.info(f"Validating parent: {parent_name}, Email: {parent_email}")
        self._validate_parent_input(
            parent_name, parent_phone, parent_email, parent_relationship_type
        )

        # Step 5: Handle parent - create or link existing
        parent: Parent
        if link_existing_parent:
            Logger.info(f"Linking to existing parent with email: {parent_email}")
            parent = await self.parent_repo.get_parent_by_email(parent_email)
            if not parent:
                raise ValidationError(
                    f"Parent with email '{parent_email}' does not exist. "
                    "Set link_existing_parent=False to create a new parent."
                )
            if not parent.is_active:
                raise ValidationError(
                    f"Parent account with email '{parent_email}' is inactive"
                )
        else:
            Logger.info(f"Creating new parent: {parent_name}")
            # Check if parent with same email already exists
            existing_parent = await self.parent_repo.get_parent_by_email(
                parent_email
            )
            if existing_parent:
                raise ValidationError(
                    f"Parent with email '{parent_email}' already exists. "
                    "Set link_existing_parent=True to link to this parent."
                )
            parent = await self.parent_repo.create_parent(
                name=parent_name,
                phone=parent_phone,
                email=parent_email,
                relationship_type=parent_relationship_type,
            )

        # Step 6: Create student
        Logger.info(f"Creating student: {student_name}")
        student = await self.enrollment_repo.create_student(
            name=student_name,
            roll_number=student_roll_number,
            class_id=class_id,
            class_name=class_name,
        )

        # Step 7: Link student and parent
        Logger.info(f"Linking student {student.id} with parent {parent.id}")
        await self.parent_repo.link_student_to_parent(student.id, parent.id)

        Logger.info(
            f"Successfully created student {student.id} "
            f"and linked with parent {parent.id}"
        )
        return student, parent

    @staticmethod
    def _validate_student_input(
        name: str, roll_number: str, class_id: int, class_name: str
    ) -> None:
        """
        Validate student input.

        Args:
            name: Student name
            roll_number: Student roll number
            class_id: Class ID
            class_name: Class name

        Raises:
            ValidationError: If validation fails
        """
        if not name or not name.strip():
            raise ValidationError("Student name is required and cannot be empty")

        if not roll_number or not roll_number.strip():
            raise ValidationError(
                "Student roll number is required and cannot be empty"
            )

        if not isinstance(class_id, int) or class_id <= 0:
            raise ValidationError("Valid class ID is required")

        if not class_name or not class_name.strip():
            raise ValidationError("Class name is required and cannot be empty")

    @staticmethod
    def _validate_parent_input(
        name: str, phone: str, email: str, relationship: str
    ) -> None:
        """
        Validate parent input.

        Args:
            name: Parent name
            phone: Phone number
            email: Email address
            relationship: Relationship to student

        Raises:
            ValidationError: If validation fails
        """
        if not name or not name.strip():
            raise ValidationError("Parent name is required and cannot be empty")

        if not phone or not phone.strip():
            raise ValidationError("Parent phone number is required")

        if not email or "@" not in email:
            raise ValidationError("Valid email address is required")

        if not relationship or not relationship.strip():
            raise ValidationError("Relationship to student is required")
