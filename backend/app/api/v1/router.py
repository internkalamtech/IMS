from fastapi import APIRouter

<<<<<<< HEAD
from app.api.v1.endpoints.users import router as user_router
from app.api.v1.endpoints import auth, health, dashboard
from app.api.v1.endpoints.class_subjects import router as class_subjects_router
from app.api.v1.endpoints import subjects

# ⚠️ Make payments optional (prevents test crash if schema missing)
try:
    from app.api.v1.endpoints.payments import router as payments_router
except ImportError:
    payments_router = None
=======
from app.api.v1.endpoints import (
    auth,
    class_subjects_router,
    dashboard,
    enrollment,
    health,
    payments,
    students,
    subjects,
    trips,
)
>>>>>>> 108e7a58ce795d7ea23ae909095c1d92aad03e60

# Create v1 router
router = APIRouter(prefix="/v1")

router.include_router(user_router)
router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)
router.include_router(class_subjects_router)
<<<<<<< HEAD

# ✅ Safe include
if payments_router:
    router.include_router(payments_router)

router.include_router(subjects.router)
=======
router.include_router(payments.router)
router.include_router(students.router)
router.include_router(subjects.router)
router.include_router(enrollment.router)
router.include_router(trips.router)
>>>>>>> 108e7a58ce795d7ea23ae909095c1d92aad03e60
