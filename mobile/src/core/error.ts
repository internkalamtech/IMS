/**
 * Base application error class
 */
export class AppError extends Error {
    constructor(public message: string, public code?: string) {
        super(message);
        this.name = 'AppError';
    }
}

/**
 * Network error class
 */
export class NetworkError extends AppError {
    constructor(message: string = 'Network error occurred', public statusCode?: number) {
        super(message, 'NETWORK_ERROR');
        this.name = 'NetworkError';
    }
}

/**
 * Validation error class
 */
export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
    }
}

/**
 * Authentication error class
 */
export class AuthError extends AppError {
    constructor(message: string = 'Authentication failed') {
        super(message, 'AUTH_ERROR');
        this.name = 'AuthError';
    }
}
