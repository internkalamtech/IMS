"""
Abstract repository interfaces for Student and Parent operations.

Defines the contract for Student and Parent data access operations.
Concrete implementations are provided in the infrastructure layer.
"""

from abc import ABC, abstractmethod
from typing import Optional, List

from app.domain.entities.parent import Parent
from app.domain.entities.payment import Student


class ParentRepository(ABC):
    """
    Abstract repository for parent data operations.

    This interface defines the contract for parent data access.
    Concrete implementations are provided in the infrastructure layer.
    """

    @abstractmethod
    async def get_parent_by_id(self, parent_id: int) -> Optional[Parent]:
        """
        Retrieve a parent by their ID.

        Args:
            parent_id: Unique identifier of the parent

        Returns:
            Parent entity if found, None otherwise
        """
        pass

    @abstractmethod
    async def get_parent_by_email(self, email: str) -> Optional[Parent]:
        """
        Retrieve a parent by their email.

        Args:
            email: Parent's email address

        Returns:
            Parent entity if found, None otherwise
        """
        pass

    @abstractmethod
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
        pass

    @abstractmethod
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
        pass

    @abstractmethod
    async def get_students_for_parent(self, parent_id: int) -> List[Student]:
        """
        Get all students linked to a parent.

        Args:
            parent_id: ID of the parent

        Returns:
            List of Student entities linked to the parent
        """
        pass


class EnrollmentRepository(ABC):
    """
    Abstract repository for student enrollment operations.

    Handles student-related database operations.
    """

    @abstractmethod
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
        pass

    @abstractmethod
    async def get_student_by_id(self, student_id: int) -> Optional[Student]:
        """
        Retrieve a student by their ID.

        Args:
            student_id: Unique identifier of the student

        Returns:
            Student entity if found, None otherwise
        """
        pass

    @abstractmethod
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
        pass

    @abstractmethod
    async def validate_class_exists(self, class_id: int) -> bool:
        """
        Validate that a class section exists.

        Args:
            class_id: ID of the class to validate

        Returns:
            True if class exists, False otherwise
        """
        pass
