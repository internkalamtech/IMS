from fastapi import APIRouter

router = APIRouter(prefix="/admin/dashboard", tags=["Admin Dashboard"])

@router.get("/")
async def get_dashboard():
    return {
        "status": "success",
        "message": "Dashboard data will come from DB"
    }