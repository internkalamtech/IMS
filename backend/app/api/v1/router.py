from fastapi import APIRouter

from app.api.v1.endpoints.users import router as user_router
from app.api.v1.endpoints import auth, health, dashboard
from app.api.v1.endpoints.class_subjects import router as class_subjects_router
from app.api.v1.endpoints import subjects

# ⚠️ Safe import for payments (kept from your code)
try:
    from app.api.v1.endpoints.payments import router as payments_router
except ImportError:
    payments_router = None

 feature/student-profile-ui
from app.api.v1.endpoints import auth, health, dashboard, homework, class_subjects_router
from app.api.v1.endpoints.payments import router as payments_router
from app.api.v1.endpoints import (
    auth,
    class_subjects_router,
    transport,
    dashboard,
    enrollment,
    health,
    payments,
    students,
    subjects,
    trips,  
    )
from app.api.v1.endpoints.payments import router as payments_router
main

# Create v1 router
router = APIRouter(prefix="/v1")

router.include_router(user_router)
router.include_router(auth.router)
router.include_router(health.router)
router.include_router(dashboard.router)
router.include_router(homework.router) 
router.include_router(transport.router)
router.include_router(class_subjects_router)

# ✅ Safe include
if payments_router:
    router.include_router(payments_router)

router.include_router(subjects.router)