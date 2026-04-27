"""
Tests for student academic performance and conduct API endpoints.

These tests cover the new /api/students routes for exam schedules and conduct remarks.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, MagicMock

from app.api.dependencies import get_current_user
from app.domain.entities.user import User
from app.infrastructure.database.database import get_db
from app.main import app


# Mock user for testing
mock_user = User(
    id="1",
    email="test@example.com",
    name="Test User",
    role="student",
    roles=[],
    avatar_url=None,
)


@pytest.fixture
async def mock_db():
    """Mock database session."""
    db = AsyncMock()
    return db


@pytest.fixture
async def client(mock_db):
    """Test client with mocked authentication and database."""
    transport = ASGITransport(app=app)

    async def override_get_current_user():
        return mock_user

    async def override_get_db():
        return mock_db

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    # Clean up overrides
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_student_exams_empty(client, mock_db):
    """Test getting exams for a student with no class assigned."""
    # Mock student with no class_id
    mock_student = MagicMock()
    mock_student.id = 1
    mock_student.class_id = None
    
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_student
    mock_db.execute.return_value = mock_result

    response = await client.get("/api/students/1/exams")

    assert response.status_code == 200
    data = response.json()
    assert data["studentId"] == "1"
    assert data["exams"] == []


@pytest.mark.asyncio
async def test_get_student_conduct_empty(client, mock_db):
    """Test getting conduct remarks for a student with no remarks."""
    # Mock student exists
    mock_student = MagicMock()
    mock_student.id = 1
    
    # Mock empty conduct remarks
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_student
    mock_result.scalars.return_value.unique.return_value.all.return_value = []
    mock_db.execute.return_value = mock_result

    response = await client.get("/api/students/1/conduct")

    assert response.status_code == 200
    data = response.json()
    assert data["studentId"] == "1"
    assert data["conductRemarks"] == []


@pytest.mark.asyncio
async def test_get_student_exams_invalid_status(client):
    """Test invalid status parameter for exam endpoint."""
    response = await client.get("/api/students/1/exams?status=invalid")

    assert response.status_code == 400
    data = response.json()
    assert "Invalid status" in data["detail"]


@pytest.mark.asyncio
async def test_get_student_conduct_invalid_severity(client):
    """Test invalid severity parameter for conduct endpoint."""
    response = await client.get("/api/students/1/conduct?severity=invalid")

    assert response.status_code == 400
    data = response.json()
    assert "Invalid severity" in data["detail"]


@pytest.mark.asyncio
async def test_get_student_conduct_invalid_date_format(client):
    """Test invalid date format for conduct endpoint."""
    response = await client.get("/api/students/1/conduct?fromDate=invalid")

    assert response.status_code == 400
    data = response.json()
    assert "Invalid fromDate format" in data["detail"]


@pytest.mark.asyncio
async def test_get_student_conduct_date_range_invalid(client):
    """Test invalid date range for conduct endpoint."""
    response = await client.get(
        "/api/students/1/conduct?fromDate=2026-04-02&toDate=2026-04-01"
    )

    assert response.status_code == 400
    data = response.json()
    assert "fromDate must be earlier" in data["detail"]


@pytest.mark.asyncio
async def test_get_student_exams_not_found(client, mock_db):
    """Test getting exams for a non-existent student."""
    # Mock student not found
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    response = await client.get("/api/students/99999/exams")

    assert response.status_code == 404
    data = response.json()
    assert "Student not found" in data["detail"]


@pytest.mark.asyncio
async def test_get_student_conduct_not_found(client, mock_db):
    """Test getting conduct remarks for a non-existent student."""
    # Mock student not found
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    response = await client.get("/api/students/99999/conduct")

    assert response.status_code == 404
    data = response.json()
    assert "Student not found" in data["detail"]