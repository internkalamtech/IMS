"""
Custom exception classes for the IMS application.

Following best practices:
- Specific exception types for different error scenarios
- Inheritance from base Exception class
- Meaningful error messages
- HTTP status code mapping
"""


class IMSException(Exception):
    """Base exception class for all IMS exceptions."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class AuthenticationError(IMSException):
    """Raised when authentication fails."""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status_code=401)


class ValidationError(IMSException):
    """Raised when input validation fails."""

    def __init__(self, message: str = "Validation error"):
        super().__init__(message, status_code=400)


class NotFoundError(IMSException):
    """Raised when a requested resource is not found."""

    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)


class DatabaseError(IMSException):
    """Raised when a database operation fails."""

    def __init__(self, message: str = "Database error occurred"):
        super().__init__(message, status_code=500)


class UnauthorizedError(IMSException):
    """Raised when user lacks permission for an action."""

    def __init__(self, message: str = "Unauthorized access"):
        super().__init__(message, status_code=403)
