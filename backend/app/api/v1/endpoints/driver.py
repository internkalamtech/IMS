from fastapi import APIRouter

router = APIRouter(prefix="/driver", tags=["Driver"])

@router.get("/documents")
def get_driver_documents():
    return [
        {"title": "Driving License", "expiryDate": "2026-04-10"},
        {"title": "Bus Insurance", "expiryDate": "2026-03-20"},
        {"title": "Fitness Certificate", "expiryDate": "2026-02-15"},
    ]