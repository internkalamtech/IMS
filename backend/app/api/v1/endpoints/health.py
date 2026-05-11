from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["Health"])


@router.get(  "",
    status_code=200,
    summary="Health check",
    description="Check if the API server is running and healthy.",
)
async def health_check() -> dict:
    return {"status": "healthy", "message": "IMS Backend is running"}