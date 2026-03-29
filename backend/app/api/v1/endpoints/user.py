"""
User endpoints.

This module provides API endpoints for user profile management.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas import ErrorResponse
from app.core.logger import Logger
from app.infrastructure.database.database import get_db

router = APIRouter(prefix="/user", tags=["User"])


class ProfileUpdateRequest(BaseModel):
    """Request model for profile update."""
    name: str
    email: EmailStr

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com"
            }
        }


class ProfileUpdateResponse(BaseModel):
    """Response model for profile update."""
    success: bool
    message: str
    data: dict = {}


@router.post(
    "/profile",
    response_model=ProfileUpdateResponse,
    status_code=status.HTTP_200_OK,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Update user profile",
    description="Update user profile with name and email",
)
async def update_user_profile(
    request: ProfileUpdateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Update user profile.

    - **name**: User's full name
    - **email**: User's email address
    """
    try:
        # Log received data
        Logger.info(
            f"📨 Received profile update request: name={request.name}, email={request.email}")

        # TODO: Update user in database
        # For now, just return success
        # In production, you would:
        # current_user.name = request.name
        # current_user.email = request.email
        # await db.commit()

        response_data = {
            "name": request.name,
            "email": request.email
        }
        Logger.info(f"✅ Returning response: {response_data}")

        return ProfileUpdateResponse(
            success=True,
            message="Profile updated successfully",
            data=response_data
        )

    except Exception as e:
        Logger.error(f"Error updating profile: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )
