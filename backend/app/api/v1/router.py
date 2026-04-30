from fastapi import APIRouter
 feature/student-profile-ui
from app.api.v1.endpoints.users import router as user_router
from app.api.v1.endpoints import auth, health, dashboard
from app.api.v1.endpoints.class_subjects import router as class_subjects_router
from app.api.v1.endpoints import subjects

feature/student-profile-ui
# ⚠️ Safe import for payments (kept from your code)
try:
    from app.api.v1.endpoints.payments import router as payments_router
except ImportError:
    payments_router = None
from app.api.v1.endpoints import auth, health, dashboard, classes, timetables, class_subjects_router
from app.api.v1.endpoints import class_subjects_router
from app.api.v1.endpoints.payments import router as payments_router
 main
from app.api.v1.endpoints import (
    auth,
    class_subjects_router,
    dashboard,
    enrollment,
    health,
    payments,
    students,
    subjects,
    student_academic,
    trips,  
    documents, 
    )
from app.api.v1.endpoints.payments import router as payments_router
 main


# Create v1 router
router = APIRouter(prefix="/v1")

# Core routers
router.include_router(user_router)
router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)
router.include_router(classes.router, prefix="/classes", tags=["classes"])
router.include_router(timetables.router, prefix="/timetables", tags=["timetables"])
router.include_router(class_subjects_router)
feature/student-profile-ui

# ✅ Safe include for payments
if payments_router:
    router.include_router(payments_router)

# Other routers
router.include_router(subjects.router)
router.include_router(payments.router)
router.include_router(students.router)
router.include_router(subjects.router)
router.include_router(enrollment.router)
router.include_router(student_academic.router)
router.include_router(trips.router)
router.include_router(documents.router)
router.include_router(staff_router)
main
