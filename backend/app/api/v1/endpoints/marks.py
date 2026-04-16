from fastapi import APIRouter
from app.api.schemas import MarksCreate


router = APIRouter()


@router.post("/marks")
def create_marks(
    data: MarksCreate,
    
):
    return {
        "message": "Marks received successfully",
        "data": data
    }