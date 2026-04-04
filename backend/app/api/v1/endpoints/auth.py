"""
Authentication endpoints.

This module provides API endpoints for user authentication.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.api.schemas import (
    LoginRequest,
    LoginResponse,
    UserResponse,
    ErrorResponse,
    RoleResponse,
    DemoCredentialsResponse,
    DemoCredential,
    TokenRefreshRequest,
    TokenRefreshResponse,
)

from app.core.config import settings
from app.core.errors import (
    AuthenticationError,
    ValidationError,
    DatabaseError,
    NotFoundError,
)
from app.core.logger import Logger
from app.core.security import (
    create_access_token,
    decode_access_token_ignore_expiry,
)
from app.domain.entities.user import User
from app.domain.usecases.auth_usecases import LoginUseCase
from app.infrastructure.database.database import get_db
from app.infrastructure.repositories.database_auth_repository import (
    DatabaseAuthRepository,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        401: {"model": ErrorResponse, "description": "Authentication failed"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="User login",
    description=(
        "Authenticate a user with email and password, "
        "return user data with JWT access token."
    ),
)
async def login(
    request: LoginRequest, db: AsyncSession = Depends(get_db)
) -> LoginResponse:
    """
    Login endpoint.

    Authenticates a user by email and password,
    returns user data with JWT token.

    Args:
        request: Login request with email and password
        db: Database session (injected)

    Returns:
        LoginResponse with user data and access token

    Raises:
        HTTPException: If validation fails or authentication error occurs
    """
    try:
        Logger.info(f"Login request received for email: {request.email}")

        # Execute login use case
        repository = DatabaseAuthRepository(db)
        use_case = LoginUseCase(repository)
        user = await use_case.execute(request.email, request.password)

        # Create access token
        access_token = create_access_token(
            data={"sub": user.id, "email": user.email}
        )

        Logger.info(f"Login successful for user: {user.email}")

        # Return response
        return LoginResponse(
            user=UserResponse(
                id=user.id,
                name=user.name,
                email=user.email,
                role=user.role,
                roles=[
                    RoleResponse(
                        id=r.id, name=r.name, description=r.description
                    )
                    for r in user.roles
                ],
                avatarUrl=user.avatar_url,
            ),
            access_token=access_token,
        )

    except AuthenticationError as e:
        Logger.warning(
            f"Authentication failed for {request.email}: {e.message}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.message,
        )
    except (ValueError, ValidationError) as e:
        Logger.warning(f"Validation error for {request.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except DatabaseError as e:
        Logger.error(
            f"Database error during login: {e.message}", exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login. Please try again later.",
        )
    except Exception as e:
        Logger.error(f"Unexpected error during login: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again later.",
        )


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="User logout",
    description=(
        "Logout the current user. Note: JWT tokens are stateless, "
        "so this is mainly for client-side cleanup."
    ),
)
async def logout(current_user: User = Depends(get_current_user)) -> dict:
    """
    Logout endpoint.

    Since JWT tokens are stateless, this endpoint mainly serves as
    a confirmation for the client to clear the token. In a
    production system, you might want to implement token
    blacklisting.

    Args:
        current_user: Current authenticated user (from dependency)

    Returns:
        Success message
    """
    return {"message": "Logged out successfully"}


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
    },
    summary="Get current user",
    description="Retrieve the currently authenticated user's information.",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """
    Get current user endpoint.

    Returns the currently authenticated user's information
    based on the JWT token.

    Args:
        current_user: Current authenticated user (from dependency)

    Returns:
        UserResponse with current user data
    """
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        roles=[
            RoleResponse(id=r.id, name=r.name, description=r.description)
            for r in current_user.roles
        ],
        avatarUrl=current_user.avatar_url,
    )


@router.post(
    "/refresh",
    response_model=TokenRefreshResponse,
    status_code=status.HTTP_200_OK,
    responses={
        401: {"model": ErrorResponse, "description": "Token validation failed"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Refresh access token",
    description=(
        "Refresh an expired or expiring access token. "
        "Accepts the current token and returns a new one."
    ),
)
async def refresh_token(
    request: TokenRefreshRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenRefreshResponse:
    """
    Refresh token endpoint.

    Accepts an expired or current access token and returns a new one.
    This allows users to continue using the API without re-logging in.

    Args:
        request: Token refresh request with the current access token
        db: Database session (injected)

    Returns:
        TokenRefreshResponse with new access token and expiry info

    Raises:
        HTTPException: If token is invalid or user not found
    """
    try:
        # Decode token without checking expiry
        payload = decode_access_token_ignore_expiry(request.access_token)

        if not payload:
            Logger.warning("Token refresh failed: invalid token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        # Extract user_id from token
        user_id = payload.get("sub")

        if not user_id:
            Logger.warning(
                "Token refresh failed: user_id not found in token"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )

        # Verify user still exists
        repository = DatabaseAuthRepository(db)
        try:
            user = await repository.get_user_by_id(user_id)
        except NotFoundError:
            Logger.warning(
                f"Token refresh failed: user {user_id} not found"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )

        # Create new access token
        new_access_token = create_access_token(
            data={"sub": user.id, "email": user.email}
        )

        expires_in = settings.access_token_expire_minutes * 60

        Logger.info(
            f"Token refreshed successfully for user: {user.email}"
        )

        return TokenRefreshResponse(
            access_token=new_access_token,
            token_type="bearer",
            expires_in=expires_in,
        )

    except HTTPException:
        raise
    except Exception as e:
        Logger.error(
            f"Unexpected error during token refresh: {str(e)}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while refreshing the token",
        )


@router.get(
    "/demo-credentials",
    response_model=DemoCredentialsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get demo credentials",
    description=(
        "Retrieve a list of demo credentials for development and testing. "
        "This is a public endpoint."
    ),
)
async def get_demo_credentials(
    db: AsyncSession = Depends(get_db),
) -> DemoCredentialsResponse:
    """
    Get demo credentials endpoint.

    Returns a list of demo credentials that can be used to log into the system.
    Users are fetched from the database based on the email domain @myuser.com.
    """
    try:
        from app.domain.usecases.auth_usecases import GetDemoUsersUseCase

        repository = DatabaseAuthRepository(db)
        use_case = GetDemoUsersUseCase(repository)
        users = await use_case.execute("%@myuser.com")

        credentials = []

        icon_map = {
            "admin": "person",
            "teacher": "school",
            "parent": "people",
            "student": "school-outline",
            "transport": "bus",
            "driver": "car-sport",
        }

        transport_roles = ["transport", "driver"]

        for user in users:
            role_name = user.role.lower()
            email_prefix = user.email.split("@")[0]
            credentials.append(
                DemoCredential(
                    role=user.role.capitalize(),
                    icon=icon_map.get(role_name, "person"),
                    email=user.email,
                    password=f"{email_prefix}123",
                    description=(
                        "Transport Roles"
                        if role_name in transport_roles
                        else "Core Roles"
                    ),
                )
            )

        # Sort credentials to keep a consistent order (Admin first etc.)
        role_order = [
            "admin",
            "teacher",
            "parent",
            "student",
            "transport",
            "driver",
        ]
        credentials.sort(
            key=lambda x: (
                role_order.index(x.role.lower())
                if x.role.lower() in role_order
                else 99
            )
        )

        return DemoCredentialsResponse(credentials=credentials)

    except Exception as e:
        Logger.error(
            f"Error fetching demo credentials: {str(e)}", exc_info=True
        )
        # Fallback to empty list if something goes wrong, but log the error
        return DemoCredentialsResponse(credentials=[])
