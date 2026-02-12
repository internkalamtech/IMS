"""
In-memory implementation of AuthRepository.

This is a sample implementation using in-memory storage for development.
In production, this would be replaced with a database-backed implementation.
"""

from app.domain.entities.user import User
from app.domain.repositories.auth_repository import AuthRepository


class InMemoryAuthRepository(AuthRepository):
    """
    In-memory implementation of AuthRepository for development/testing.
    
    This implementation stores users in memory and provides mock data.
    Replace with a database-backed implementation for production.
    """

    def __init__(self):
        """Initialize the repository with sample users."""
        # Sample users for development
        self._users: dict[str, User] = {
            "1": User(
                id="1",
                name="Admin User",
                email="admin@example.com",
                role="admin",
                avatar_url="https://i.pravatar.cc/150?u=admin",
            ),
            "2": User(
                id="2",
                name="John Doe",
                email="john@example.com",
                role="teacher",
                avatar_url="https://i.pravatar.cc/150?u=john",
            ),
            "3": User(
                id="3",
                name="Jane Smith",
                email="jane@example.com",
                role="student",
                avatar_url="https://i.pravatar.cc/150?u=jane",
            ),
        }

    async def login(self, email: str) -> User:
        """
        Authenticate a user by email.
        
        Args:
            email: User's email address
            
        Returns:
            User entity if found
            
        Raises:
            ValueError: If user not found
        """
        # Find user by email
        user = await self.get_user_by_email(email)
        if not user:
            # For development, create a new user if not found
            new_id = str(len(self._users) + 1)
            user = User(
                id=new_id,
                name=email.split("@")[0].title(),
                email=email,
                role="student",
                avatar_url=f"https://i.pravatar.cc/150?u={new_id}",
            )
            self._users[new_id] = user

        return user

    async def get_user_by_id(self, user_id: str) -> User | None:
        """
        Retrieve a user by their ID.
        
        Args:
            user_id: Unique identifier of the user
            
        Returns:
            User entity if found, None otherwise
        """
        return self._users.get(user_id)

    async def get_user_by_email(self, email: str) -> User | None:
        """
        Retrieve a user by their email.
        
        Args:
            email: Email address of the user
            
        Returns:
            User entity if found, None otherwise
        """
        for user in self._users.values():
            if user.email == email:
                return user
        return None
