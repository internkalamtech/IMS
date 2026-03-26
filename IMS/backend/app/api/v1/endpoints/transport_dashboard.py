from fastapi import APIRouter

router = APIRouter()

@router.get("/dashboard")
async def get_transport_dashboard():
    return {
        "total_buses": 25,
        "active_drivers": 18,
        "routes": 12,
        "students_using_transport": 320
    }