from fastapi import APIRouter

router = APIRouter(prefix="/driver", tags=["Driver"])


@router.get("/documents")
def get_driver_documents():
    return [
        {"title": "Driving License", "expiryDate": "2026-04-10"},
        {"title": "Bus Insurance", "expiryDate": "2026-03-20"},
        {"title": "Fitness Certificate", "expiryDate": "2026-02-15"},
    ]


@router.get("/maintenance")
def get_driver_maintenance():
    return [
        {
            "title": "Oil Change",
            "date": "2026-03-20",
            "status": "Scheduled",
            "vehicleId": "BUS-101"
        },
        {
            "title": "Tire Check",
            "date": "2026-03-15",
            "status": "In Progress",
            "vehicleId": "BUS-101"
        },
        {
            "title": "Brake Inspection",
            "date": "2026-02-28",
            "status": "Completed",
            "vehicleId": "BUS-101"
        }
    ]