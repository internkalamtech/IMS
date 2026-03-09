from fastapi import APIRouter

router = APIRouter(prefix="/admin/dashboard", tags=["Admin Dashboard"])


@router.get("/")
async def get_dashboard():
    return {
        "stats": [
            {"label": "Total Students", "value": "120"},
            {"label": "Total Teachers", "value": "25"}
        ]
    }
