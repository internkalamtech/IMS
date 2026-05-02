"""
Tests for the parent fee-monitoring endpoint and related use cases.

Covers success, forbidden access, and parent-not-found cases.
"""

import pytest
from datetime import datetime
from unittest.mock import AsyncMock

from httpx import AsyncClient, ASGITransport

from app.api.dependencies import get_current_user
from app.core.errors import NotFoundError
from app.domain.entities.parent import Parent
from app.domain.entities.payment import FeeStructure, Payment, Student
from app.domain.entities.user import Role, User
from app.domain.usecases.enrollment_usecases import GetParentFeeMonitoringUseCase
from app.infrastructure.repositories.database_enrollment_repository import (
    DatabaseParentRepository,
)
from app.infrastructure.repositories.database_payment_repository import (
    DatabasePaymentRepository,
)
from app.main import app


# ============================================================================
# Helpers
# ============================================================================


def _make_user(role: str, user_id: str = "1") -> User:
    """Create a test User entity with the given role."""
    return User(
        id=user_id,
        name="Test User",
        email="test@example.com",
        role=role,
        roles=[Role(id="1", name=role)],
    )


def _make_parent(parent_id: int = 1) -> Parent:
    return Parent(
        id=parent_id,
        user_id=1,
        name="Jane Doe",
        phone="+1-555-000-0000",
        email="jane@example.com",
        relationship_type="Mother",
        is_active=True,
        created_at=datetime(2024, 1, 1),
        updated_at=datetime(2024, 1, 1),
    )


def _make_student(student_id: int = 10) -> Student:
    return Student(
        id=student_id,
        name="John Doe",
        roll_number="A-001",
        class_name="Grade 6-A",
    )


def _make_fee_structure(fs_id: int = 100, student_id: int = 10) -> FeeStructure:
    return FeeStructure(
        id=fs_id,
        student_id=student_id,
        total_fee=50000.0,
        amount_paid=25000.0,
        fee_type="Tuition",
        academic_year="2024-25",
    )


# ============================================================================
# Use Case Unit Tests
# ============================================================================


@pytest.mark.asyncio
async def test_get_parent_fee_monitoring_success():
    """GetParentFeeMonitoringUseCase returns parent + children data."""
    parent_repo = AsyncMock(spec=DatabaseParentRepository)
    payment_repo = AsyncMock(spec=DatabasePaymentRepository)

    parent = _make_parent(parent_id=1)
    student = _make_student(student_id=10)
    fee_structure = _make_fee_structure(fs_id=100, student_id=10)

    parent_repo.get_parent_by_id.return_value = parent
    parent_repo.get_students_for_parent.return_value = [student]
    payment_repo.get_fee_structures_by_student.return_value = [fee_structure]
    payment_repo.get_payments_by_fee_structure.return_value = []

    use_case = GetParentFeeMonitoringUseCase(parent_repo, payment_repo)
    result_parent, children_data = await use_case.execute(parent_id=1)

    assert result_parent.id == 1
    assert len(children_data) == 1
    result_student, fee_with_payments = children_data[0]
    assert result_student.id == 10
    assert len(fee_with_payments) == 1
    result_fs, payments = fee_with_payments[0]
    assert result_fs.id == 100
    assert payments == []


@pytest.mark.asyncio
async def test_get_parent_fee_monitoring_parent_not_found():
    """GetParentFeeMonitoringUseCase raises NotFoundError for unknown parent."""
    parent_repo = AsyncMock(spec=DatabaseParentRepository)
    payment_repo = AsyncMock(spec=DatabasePaymentRepository)

    parent_repo.get_parent_by_id.return_value = None

    use_case = GetParentFeeMonitoringUseCase(parent_repo, payment_repo)

    with pytest.raises(NotFoundError):
        await use_case.execute(parent_id=999)


# ============================================================================
# Endpoint Tests
# ============================================================================


@pytest.mark.asyncio
async def test_fee_monitoring_endpoint_forbidden_for_non_parent():
    """Non-parent/admin users receive 403 on the fee-monitoring endpoint."""
    teacher_user = _make_user(role="teacher", user_id="5")

    app.dependency_overrides[get_current_user] = lambda: teacher_user

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(
            transport=transport, base_url="http://test"
        ) as client:
            response = await client.get("/api/v1/enrollment/parents/1/fee-monitoring")
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_fee_monitoring_endpoint_forbidden_for_wrong_parent():
    """A parent may only access their own data; accessing another parent's yields 403."""
    # user_id="2" != parent_id=1
    parent_user = _make_user(role="parent", user_id="2")

    app.dependency_overrides[get_current_user] = lambda: parent_user

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(
            transport=transport, base_url="http://test"
        ) as client:
            response = await client.get("/api/v1/enrollment/parents/1/fee-monitoring")
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_fee_monitoring_endpoint_parent_not_found(monkeypatch):
    """Returns 404 when the parent record does not exist."""
    admin_user = _make_user(role="admin", user_id="1")

    app.dependency_overrides[get_current_user] = lambda: admin_user

    # Patch GetParentFeeMonitoringUseCase.execute to raise NotFoundError
    async def _mock_execute(self: GetParentFeeMonitoringUseCase, parent_id: int) -> None:
        raise NotFoundError(f"Parent with id {parent_id} not found.")

    monkeypatch.setattr(
        GetParentFeeMonitoringUseCase, "execute", _mock_execute
    )

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(
            transport=transport, base_url="http://test"
        ) as client:
            response = await client.get("/api/v1/enrollment/parents/999/fee-monitoring")
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_fee_monitoring_endpoint_admin_own_parent_allowed(monkeypatch):
    """Admin role can access any parent's fee-monitoring data."""
    admin_user = _make_user(role="admin", user_id="99")

    app.dependency_overrides[get_current_user] = lambda: admin_user

    parent = _make_parent(parent_id=1)
    student = _make_student(student_id=10)
    fee_structure = _make_fee_structure(fs_id=100, student_id=10)

    from typing import Tuple

    async def _mock_execute(self: GetParentFeeMonitoringUseCase, parent_id: int) -> Tuple:
        return parent, [(student, [(fee_structure, [])])]

    monkeypatch.setattr(
        GetParentFeeMonitoringUseCase, "execute", _mock_execute
    )

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(
            transport=transport, base_url="http://test"
        ) as client:
            response = await client.get("/api/v1/enrollment/parents/1/fee-monitoring")
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert response.status_code == 200
    data = response.json()
    assert data["parent_id"] == 1
    assert data["parent_name"] == "Jane Doe"


@pytest.mark.asyncio
async def test_fee_monitoring_endpoint_parent_own_data_allowed(monkeypatch):
    """A parent can access their own fee-monitoring data."""
    # user_id="1" matches parent_id=1
    parent_user = _make_user(role="parent", user_id="1")

    app.dependency_overrides[get_current_user] = lambda: parent_user

    parent = _make_parent(parent_id=1)
    student = _make_student(student_id=10)
    fee_structure = _make_fee_structure(fs_id=100, student_id=10)

    from typing import Tuple

    async def _mock_execute(self: GetParentFeeMonitoringUseCase, parent_id: int) -> Tuple:
        return parent, [(student, [(fee_structure, [])])]

    monkeypatch.setattr(
        GetParentFeeMonitoringUseCase, "execute", _mock_execute
    )

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(
            transport=transport, base_url="http://test"
        ) as client:
            response = await client.get("/api/v1/enrollment/parents/1/fee-monitoring")
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert response.status_code == 200
    data = response.json()
    assert data["parent_id"] == 1
