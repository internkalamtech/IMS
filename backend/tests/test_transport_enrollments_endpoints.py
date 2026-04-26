import pytest
from httpx import ASGITransport, AsyncClient

from app.api.dependencies import get_current_user
from app.api.v1.endpoints import transport_enrollments as transport_enrollments_module
from app.domain.entities.user import Role, User
from app.domain.usecases.student_transport_enrollment import (
    StudentTransportEnrollmentUseCase,
)
from app.infrastructure.database.database import get_db
from app.main import app


class _Student:
    def __init__(self, student_id: int, name: str):
        self.id = student_id
        self.name = name


class _Enrollment:
    def __init__(
        self,
        enrollment_id: int,
        student_id: int,
        route_id: str,
        stop_id: int,
        student: _Student,
    ):
        self.id = enrollment_id
        self.student_id = student_id
        self.route_id = route_id
        self.stop_id = stop_id
        self.pickup_time = None
        self.dropoff_time = None
        self.student = student


class InMemoryStudentTransportRepository:
    def __init__(self):
        self.students = {
            1: _Student(1, "Aarav"),
            2: _Student(2, "Bhavya"),
            3: _Student(3, "Charu"),
        }
        self._enrollments_by_key: dict[tuple[int, str], _Enrollment] = {}
        self._next_id = 1
        self.create_calls = 0

    async def get_student_by_id(self, student_id: int):
        return self.students.get(student_id)

    async def get_enrollment(self, student_id: int, route_id: str):
        return self._enrollments_by_key.get((student_id, route_id))

    async def create_enrollment(
        self,
        student_id: int,
        route_id: str,
        stop_id: int,
        pickup_time,
        dropoff_time,
    ):
        self.create_calls += 1
        existing = self._enrollments_by_key.get((student_id, route_id))
        if existing is not None:
            return existing

        student = self.students[student_id]
        enrollment = _Enrollment(
            enrollment_id=self._next_id,
            student_id=student_id,
            route_id=route_id,
            stop_id=stop_id,
            student=student,
        )
        enrollment.pickup_time = pickup_time
        enrollment.dropoff_time = dropoff_time
        self._enrollments_by_key[(student_id, route_id)] = enrollment
        self._next_id += 1
        return enrollment

    async def list_students_by_route(self, route_id: str):
        route_enrollments = [
            enrollment
            for enrollment in self._enrollments_by_key.values()
            if enrollment.route_id == route_id
        ]
        return sorted(route_enrollments, key=lambda enrollment: enrollment.stop_id)


@pytest.fixture(autouse=True)
def _reset_dependency_overrides():
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def transport_repo(monkeypatch) -> InMemoryStudentTransportRepository:
    repo = InMemoryStudentTransportRepository()

    monkeypatch.setattr(
        transport_enrollments_module,
        "StudentTransportRepository",
        lambda _db: repo,
    )
    monkeypatch.setattr(
        transport_enrollments_module,
        "StudentTransportEnrollmentUseCase",
        StudentTransportEnrollmentUseCase,
    )

    async def _override_get_db():
        yield object()

    app.dependency_overrides[get_db] = _override_get_db
    return repo


def _set_current_user(role: str):
    async def _override_get_current_user() -> User:
        return User(
            id="u1",
            name="Test User",
            email="test@example.com",
            role=role,
            roles=[Role(id="1", name=role, description=None)],
            avatar_url=None,
        )

    app.dependency_overrides[get_current_user] = _override_get_current_user


@pytest.mark.asyncio
async def test_create_enrollments_rejects_for_unauthorized_role(
    transport_repo: InMemoryStudentTransportRepository,
):
    _set_current_user("teacher")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/transport/enrollments",
            json={
                "enrollments": [
                    {
                        "studentId": 1,
                        "routeId": "route_010",
                        "stopId": 2,
                    }
                ]
            },
        )

    assert response.status_code == 403
    assert response.json()["detail"] == "Insufficient permissions"


@pytest.mark.asyncio
async def test_create_enrollments_allows_admin_role(
    transport_repo: InMemoryStudentTransportRepository,
):
    _set_current_user("admin")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/transport/enrollments",
            json={
                "enrollments": [
                    {
                        "studentId": 1,
                        "routeId": "route_010",
                        "stopId": 2,
                    }
                ]
            },
        )

    assert response.status_code == 201
    assert response.json()["count"] == 1
    assert response.json()["enrollments"][0]["studentId"] == 1
    assert response.json()["enrollments"][0]["routeId"] == "route_010"
    assert response.json()["enrollments"][0]["stopId"] == 2


@pytest.mark.asyncio
async def test_get_students_by_route_rejects_for_unauthorized_role(
    transport_repo: InMemoryStudentTransportRepository,
):
    _set_current_user("teacher")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/transport/routes/route_010/students")

    assert response.status_code == 403
    assert response.json()["detail"] == "Insufficient permissions"


@pytest.mark.asyncio
async def test_get_students_by_route_allows_transport_role(
    transport_repo: InMemoryStudentTransportRepository,
):
    _set_current_user("transport")

    await transport_repo.create_enrollment(
        student_id=1,
        route_id="route_077",
        stop_id=10,
        pickup_time=None,
        dropoff_time=None,
    )

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/transport/routes/route_077/students")

    assert response.status_code == 200
    body = response.json()

    assert body["routeId"] == "route_077"
    assert body["totalStudents"] == 1
    assert [student["studentId"] for student in body["students"]] == [1]


@pytest.mark.asyncio
async def test_create_enrollments_is_idempotent_for_existing_records(
    transport_repo: InMemoryStudentTransportRepository,
):
    _set_current_user("transport")

    payload = {
        "enrollments": [
            {
                "studentId": 1,
                "routeId": "route_010",
                "stopId": 2,
            }
        ]
    }

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        first_response = await client.post(
            "/api/v1/transport/enrollments",
            json=payload,
        )
        second_response = await client.post(
            "/api/v1/transport/enrollments",
            json=payload,
        )

    assert first_response.status_code == 201
    assert second_response.status_code == 201

    first_body = first_response.json()
    second_body = second_response.json()

    assert first_body["count"] == 1
    assert second_body["count"] == 1
    assert first_body["enrollments"][0]["id"] == second_body["enrollments"][0]["id"]
    assert first_body["enrollments"][0]["studentId"] == 1
    assert first_body["enrollments"][0]["routeId"] == "route_010"
    assert first_body["enrollments"][0]["stopId"] == 2
    assert transport_repo.create_calls == 2


@pytest.mark.asyncio
async def test_get_students_by_route_returns_manifest_sorted_by_stop_id(
    transport_repo: InMemoryStudentTransportRepository,
):
    _set_current_user("driver")

    # Seed unsorted enrollments for the same route to verify stop ordering.
    await transport_repo.create_enrollment(
        student_id=1,
        route_id="route_077",
        stop_id=30,
        pickup_time=None,
        dropoff_time=None,
    )
    await transport_repo.create_enrollment(
        student_id=2,
        route_id="route_077",
        stop_id=10,
        pickup_time=None,
        dropoff_time=None,
    )
    await transport_repo.create_enrollment(
        student_id=3,
        route_id="route_077",
        stop_id=20,
        pickup_time=None,
        dropoff_time=None,
    )

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/transport/routes/route_077/students")

    assert response.status_code == 200
    body = response.json()

    assert body["routeId"] == "route_077"
    assert body["totalStudents"] == 3
    assert [student["stopId"] for student in body["students"]] == [10, 20, 30]
    assert [student["studentId"] for student in body["students"]] == [2, 3, 1]
