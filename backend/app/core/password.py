"""
Password hashing and verification utilities.

This module provides secure password handling using bcrypt.

Following security best practices:
- bcrypt for password hashing (industry standard)
- Automatic salt generation
- Configurable work factor (cost)
- Constant-time comparison to prevent timing attacks
"""

import bcrypt


class PasswordHasher:
    """
    Password hashing utility using bcrypt.
    
    Bcrypt is designed for password hashing and includes:
    - Automatic salt generation
    - Configurable work factor (computational cost)
    - Resistance to rainbow table attacks
    """

    def __init__(self, rounds: int = 12):
        """
        Initialize password hasher.
        
        Args:
            rounds: Number of rounds for bcrypt (default: 12)
                   Higher values are more secure but slower.
                   Recommended: 12-14 for production
        """
        self.rounds = rounds

    def hash(self, password: str) -> str:
        """
        Hash a password using bcrypt.
        
        Args:
            password: Plain text password to hash
            
        Returns:
            Hashed password as string
            
        Example:
            hasher = PasswordHasher()
            hashed = hasher.hash("mypassword123")
        """
        # Convert password to bytes
        password_bytes = password.encode("utf-8")
        
        # Generate salt and hash
        salt = bcrypt.gensalt(rounds=self.rounds)
        hashed = bcrypt.hashpw(password_bytes, salt)
        
        # Return as string
        return hashed.decode("utf-8")

    def verify(self, password: str, hashed_password: str) -> bool:
        """
        Verify a password against a hash.
        
        Args:
            password: Plain text password to verify
            hashed_password: Previously hashed password
            
        Returns:
            True if password matches, False otherwise
            
        Example:
            hasher = PasswordHasher()
            is_valid = hasher.verify("mypassword123", stored_hash)
        """
        # Convert to bytes
        password_bytes = password.encode("utf-8")
        hashed_bytes = hashed_password.encode("utf-8")
        
        # Verify using constant-time comparison
        return bcrypt.checkpw(password_bytes, hashed_bytes)


# Global instance for convenience
password_hasher = PasswordHasher(rounds=12)


def hash_password(password: str) -> str:
    """
    Convenience function to hash a password.
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password
    """
    return password_hasher.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """
    Convenience function to verify a password.
    
    Args:
        password: Plain text password
        hashed_password: Hashed password to compare against
        
    Returns:
        True if password matches, False otherwise
    """
    return password_hasher.verify(password, hashed_password)
