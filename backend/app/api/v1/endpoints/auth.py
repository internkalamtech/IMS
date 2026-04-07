"""
Authentication endpoints.

This module provides API endpoints for user authentication.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.api.schemas import (
    LoginRequest,
    LoginResponse,
    CreateUserRequest,
    UserResponse,
    ErrorResponse,
    RoleResponse,
    DemoCredentialsResponse,
    DemoCredential,
)

from app.core.errors import AuthenticationError, ValidationError, DatabaseError
from app.core.logger import Logger
from app.core.password import hash_password
from app.core.security import create_access_token
from app.domain.entities.user import User
from app.domain.usecases.auth_usecases import LoginUseCase
from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import RoleModel, UserModel
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


@router.post(
    "/create-user",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        409: {"model": ErrorResponse, "description": "User already exists"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Create a new user",
    description="Create a new user record in the database with a default password.",
)
async def create_user(
    request: CreateUserRequest,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Create a user record from name and email."""
    try:
        name = request.name.strip()
        email = request.email.lower().strip()

        if not name:
            raise ValueError("Name is required")

        result = await db.execute(select(UserModel).where(UserModel.email == email))
        existing_user = result.unique().scalar_one_or_none()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists",
            )

        password_hash = hash_password("Temp@1234")

        # Create user model
        user_model = UserModel(
            email=email,
            name=name,
            password_hash=password_hash,
            is_active=True,
        )

        # Ensure default role exists
        result = await db.execute(select(RoleModel).where(RoleModel.name == "student"))
        default_role = result.unique().scalar_one_or_none()
        if not default_role:
            default_role = RoleModel(
                name="student", description="Default student role"
            )
            db.add(default_role)
            await db.flush()

        user_model.roles.append(default_role)

        db.add(user_model)
        await db.flush()

        return UserResponse(
            id=str(user_model.id),
            name=user_model.name,
            email=user_model.email,
            role=default_role.name,
            roles=[
                RoleResponse(
                    id=str(default_role.id),
                    name=default_role.name,
                    description=default_role.description,
                )
            ],
            avatarUrl=None,
        )
    except HTTPException:
        raise
    except ValueError as e:
        Logger.warning(f"Validation error while creating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        Logger.error(f"Unexpected error while creating user: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating user.",
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
