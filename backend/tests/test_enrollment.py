"""
Unit tests for student enrollment with parent link.

Tests for API endpoints, use cases, and repositories.
"""

import pytest # type: ignore
from datetime import datetime
from unittest.mock import Mock, AsyncMock, patch
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas import CreateStudentWithParentRequest, ParentInput, StudentInput
from app.core.errors import ValidationError, DatabaseError
from app.domain.entities.parent import Parent
from app.domain.entities.payment import Student
from app.domain.usecases.enrollment_usecases import CreateStudentWithParentUseCase
from app.infrastructure.repositories.database_enrollment_repository import (
    DatabaseEnrollmentRepository,
    DatabaseParentRepository,
)


# Fixtures
# 


@pytest.fixture
def mock_db():
    """Create a mock database session."""
    return AsyncMock(spec=AsyncSession)


@pytest.fixture
def sample_student_input():
    """Create sample student input."""
    return StudentInput(
        name="John Doe",
        roll_number="A-001",
        class_id=1,
        class_name="Grade 6-A",
    )


@pytest.fixture
def sample_parent_input():
    """Create sample parent input."""
    return ParentInput(
        name="Jane Doe",
        phone="+1-555-123-4567",
        email="jane.doe@example.com",
        relationship_type="Mother",
        address="123 Main St",
    )


@pytest.fixture
def sample_student_entity():
    """Create sample student entity."""
    return Student(
        id=1,
        name="John Doe",
        roll_number="A-001",
        class_name="Grade 6-A",
        next_due_date=None,
    )


@pytest.fixture
def sample_parent_entity():
    """Create sample parent entity."""
    return Parent(
        id=1,
        user_id=None,
        name="Jane Doe",
        phone="+1-555-123-4567",
        email="jane.doe@example.com",
        relationship_type="Mother",
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


# Use Case Tests


@pytest.mark.asyncio
async def test_create_student_with_parent_success(
    sample_student_input,
    sample_parent_input,
    sample_student_entity,
    sample_parent_entity,
):
    """Test successful student and parent creation."""
    # Setup
    enrollment_repo = AsyncMock(spec=DatabaseEnrollmentRepository)
    parent_repo = AsyncMock(spec=DatabaseParentRepository)

    enrollment_repo.validate_class_exists.return_value = True
    enrollment_repo.get_student_by_roll_number.return_value = None
    enrollment_repo.create_student.return_value = sample_student_entity

    parent_repo.get_parent_by_email.return_value = None
    parent_repo.create_parent.return_value = sample_parent_entity
    parent_repo.link_student_to_parent.return_value = None

    use_case = CreateStudentWithParentUseCase(enrollment_repo, parent_repo)

    # Execute
    student, parent = await use_case.execute(
        student_name=sample_student_input.name,
        student_roll_number=sample_student_input.roll_number,
        class_id=sample_student_input.class_id,
        class_name=sample_student_input.class_name,
        parent_name=sample_parent_input.name,
        parent_phone=sample_parent_input.phone,
        parent_email=sample_parent_input.email,
        parent_relationship_type=sample_parent_input.relationship_type,
        link_existing_parent=False,
    )

    # Assert
    assert student.id == 1
    assert student.name == "John Doe"
    assert parent.id == 1
    assert parent.email == "jane.doe@example.com"

    # Verify calls
    enrollment_repo.validate_class_exists.assert_called_once_with(
        sample_student_input.class_id
    )
    enrollment_repo.get_student_by_roll_number.assert_called_once_with(
        sample_student_input.roll_number
    )
    enrollment_repo.create_student.assert_called_once()
    parent_repo.create_parent.assert_called_once()
    parent_repo.link_student_to_parent.assert_called_once_with(
        student.id, parent.id
    )


@pytest.mark.asyncio
async def test_create_student_with_existing_parent(
    sample_student_input, sample_parent_input, sample_student_entity, sample_parent_entity
):
    """Test linking student to existing parent."""
    # Setup
    enrollment_repo = AsyncMock(spec=DatabaseEnrollmentRepository)
    parent_repo = AsyncMock(spec=DatabaseParentRepository)

    enrollment_repo.validate_class_exists.return_value = True
    enrollment_repo.get_student_by_roll_number.return_value = None
    enrollment_repo.create_student.return_value = sample_student_entity

    parent_repo.get_parent_by_email.return_value = sample_parent_entity
    parent_repo.link_student_to_parent.return_value = None

    use_case = CreateStudentWithParentUseCase(enrollment_repo, parent_repo)

    # Execute
    student, parent = await use_case.execute(
        student_name=sample_student_input.name,
        student_roll_number=sample_student_input.roll_number,
        class_id=sample_student_input.class_id,
        class_name=sample_student_input.class_name,
        parent_name=sample_parent_input.name,
        parent_phone=sample_parent_input.phone,
        parent_email=sample_parent_input.email,
        parent_relationship_type=sample_parent_input.relationship_type,
        link_existing_parent=True,
    )

    # Assert
    assert student.id == 1
    assert parent.id == 1

    # Verify parent was not created
    parent_repo.create_parent.assert_not_called()
    parent_repo.get_parent_by_email.assert_called_once()
    parent_repo.link_student_to_parent.assert_called_once()


@pytest.mark.asyncio
async def test_create_student_invalid_name(sample_parent_input):
    """Test validation error for empty student name."""
    enrollment_repo = AsyncMock(spec=DatabaseEnrollmentRepository)
    parent_repo = AsyncMock(spec=DatabaseParentRepository)

    use_case = CreateStudentWithParentUseCase(enrollment_repo, parent_repo)

    # Execute and assert
    with pytest.raises(ValidationError) as exc_info:
        await use_case.execute(
            student_name="",  # Invalid: empty name
            student_roll_number="A-001",
            class_id=1,
            class_name="Grade 6-A",
            parent_name=sample_parent_input.name,
            parent_phone=sample_parent_input.phone,
            parent_email=sample_parent_input.email,
            parent_relationship_type=sample_parent_input.relationship_type,
        )

    assert "name" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_create_student_invalid_class_id(
    sample_student_input, sample_parent_input
):
    """Test validation error for invalid class ID."""
    enrollment_repo = AsyncMock(spec=DatabaseEnrollmentRepository)
    parent_repo = AsyncMock(spec=DatabaseParentRepository)

    use_case = CreateStudentWithParentUseCase(enrollment_repo, parent_repo)

    # Execute and assert
    with pytest.raises(ValidationError) as exc_info:
        await use_case.execute(
            student_name=sample_student_input.name,
            student_roll_number=sample_student_input.roll_number,
            class_id=-1,  # Invalid: negative class ID
            class_name=sample_student_input.class_name,
            parent_name=sample_parent_input.name,
            parent_phone=sample_parent_input.phone,
            parent_email=sample_parent_input.email,
            parent_relationship_type=sample_parent_input.relationship_type,
        )

    assert "class" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_create_student_duplicate_roll_number(
    sample_student_input, sample_parent_input
):
    """Test validation error for duplicate roll number."""
    enrollment_repo = AsyncMock(spec=DatabaseEnrollmentRepository)
    parent_repo = AsyncMock(spec=DatabaseParentRepository)

    # Simulate existing student with same roll number
    existing_student = Student(
        id=999,
        name="Existing Student",
        roll_number=sample_student_input.roll_number,
        class_name="Grade 6-B",
    )
    enrollment_repo.validate_class_exists.return_value = True
    enrollment_repo.get_student_by_roll_number.return_value = existing_student

    use_case = CreateStudentWithParentUseCase(enrollment_repo, parent_repo)

    # Execute and assert
    with pytest.raises(ValidationError) as exc_info:
        await use_case.execute(
            student_name=sample_student_input.name,
            student_roll_number=sample_student_input.roll_number,
            class_id=sample_student_input.class_id,
            class_name=sample_student_input.class_name,
            parent_name=sample_parent_input.name,
            parent_phone=sample_parent_input.phone,
            parent_email=sample_parent_input.email,
            parent_relationship_type=sample_parent_input.relationship_type,
        )

    assert "already exists" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_create_student_invalid_email(sample_student_input):
    """Test validation error for invalid parent email."""
    enrollment_repo = AsyncMock(spec=DatabaseEnrollmentRepository)
    parent_repo = AsyncMock(spec=DatabaseParentRepository)

    enrollment_repo.validate_class_exists.return_value = True
    enrollment_repo.get_student_by_roll_number.return_value = None

    use_case = CreateStudentWithParentUseCase(enrollment_repo, parent_repo)

    # Execute and assert
    with pytest.raises(ValidationError) as exc_info:
        await use_case.execute(
            student_name=sample_student_input.name,
            student_roll_number=sample_student_input.roll_number,
            class_id=sample_student_input.class_id,
            class_name=sample_student_input.class_name,
            parent_name="Jane Doe",
            parent_phone="+1-555-123-4567",
            parent_email="invalid-email",  # Invalid: missing @
            parent_relationship_type="Mother",
        )

    assert "email" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_link_to_nonexistent_parent(sample_student_input, sample_parent_input):
    """Test error when trying to link to nonexistent parent."""
    enrollment_repo = AsyncMock(spec=DatabaseEnrollmentRepository)
    parent_repo = AsyncMock(spec=DatabaseParentRepository)

    enrollment_repo.validate_class_exists.return_value = True
    enrollment_repo.get_student_by_roll_number.return_value = None

    parent_repo.get_parent_by_email.return_value = None  # Parent doesn't exist

    use_case = CreateStudentWithParentUseCase(enrollment_repo, parent_repo)

    # Execute and assert
    with pytest.raises(ValidationError) as exc_info:
        await use_case.execute(
            student_name=sample_student_input.name,
            student_roll_number=sample_student_input.roll_number,
            class_id=sample_student_input.class_id,
            class_name=sample_student_input.class_name,
            parent_name=sample_parent_input.name,
            parent_phone=sample_parent_input.phone,
            parent_email=sample_parent_input.email,
            parent_relationship_type=sample_parent_input.relationship_type,
            link_existing_parent=True,
        )

    assert "does not exist" in str(exc_info.value).lower()
