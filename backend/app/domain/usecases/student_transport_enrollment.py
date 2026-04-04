"""Use cases for student transport enrollment and route manifest queries."""

from app.core.errors import NotFoundError, ValidationError


class StudentTransportEnrollmentUseCase:
    """Create enrollments and fetch route-wise student manifests."""

    def __init__(self, repository):
        self.repository = repository

    async def create_enrollments(self, enrollments: list[dict]) -> list[dict]:
        created_items = []

        for item in enrollments:
            student = await self.repository.get_student_by_id(item["student_id"])
            if not student:
                raise NotFoundError(
                    f"Student with id {item['student_id']} not found"
                )

            existing = await self.repository.get_enrollment(
                item["student_id"],
                item["route_id"],
            )
            if existing:
                raise ValidationError(
                    "Enrollment already exists for this student and route"
                )

            created = await self.repository.create_enrollment(
                student_id=item["student_id"],
                route_id=item["route_id"],
                stop_id=item["stop_id"],
                pickup_time=item.get("pickup_time"),
                dropoff_time=item.get("dropoff_time"),
            )

            created_items.append(
                {
                    "id": created.id,
                    "student_id": created.student_id,
                    "route_id": created.route_id,
                    "stop_id": created.stop_id,
                    "pickup_time": (
                        created.pickup_time.isoformat()
                        if created.pickup_time
                        else None
                    ),
                    "dropoff_time": (
                        created.dropoff_time.isoformat()
                        if created.dropoff_time
                        else None
                    ),
                }
            )

        return created_items

    async def get_students_for_route(self, route_id: int) -> dict:
        enrollments = await self.repository.list_students_by_route(route_id)

        students = []
        for enrollment in enrollments:
            students.append(
                {
                    "student_id": enrollment.student_id,
                    "student_name": enrollment.student.name,
                    "stop_id": enrollment.stop_id,
                    "pickup_time": (
                        enrollment.pickup_time.isoformat()
                        if enrollment.pickup_time
                        else None
                    ),
                    "dropoff_time": (
                        enrollment.dropoff_time.isoformat()
                        if enrollment.dropoff_time
                        else None
                    ),
                }
            )

        return {
            "route_id": route_id,
            "total_students": len(students),
            "students": students,
        }
