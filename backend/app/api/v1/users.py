from fastapi import APIRouter

router = APIRouter()

@router.get("/users")
async def get_users():
    return {
        "status": "success",
        "message": "Users endpoint ready. DB integration pending."
    }