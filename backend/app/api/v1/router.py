from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
from app.api.v1.endpoints import (
    health,
    dashboard,
    users,
    homework,
    enrollment,
    payments,
    students,
    subjects,
    trips,
)

from app.api.v1.endpoints.payments import router as payments_router
from app.api.v1.endpoints.attendance import router as attendance_router
from app.api.v1.endpoints.class_subjects import router as class_subjects_router
from app.api.v1.endpoints.staff import router as staff_router

router = APIRouter(prefix="/api/v1")

router.include_router(health.router)
router.include_router(auth.router)
router.include_router(dashboard.router)
router.include_router(users.router)
router.include_router(homework.router)
router.include_router(class_subjects_router)
router.include_router(payments_router)
router.include_router(attendance_router)
router.include_router(students.router)
router.include_router(subjects.router)
router.include_router(enrollment.router)
router.include_router(trips.router)
router.include_router(staff_router)
