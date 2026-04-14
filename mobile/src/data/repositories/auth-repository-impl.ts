import { api } from '@/core/api-client';
import {
    clearStoredAuth,
    getStoredToken,
    TOKEN_STORAGE_KEY,
    USER_STORAGE_KEY,
} from '@/core/auth-storage';
import { NetworkError } from '@/core/error';
import { Logger } from '@/core/logger';
import { StorageService } from '@/data/local/storage';
import { DemoCredential } from '@/domain/entities/demo-credential';
import { User } from '@/domain/entities/user';
import { AuthRepository } from '@/domain/repositories/auth-repository';

export class AuthRepositoryImpl implements AuthRepository {
    async login(email: string, password: string): Promise<User> {
        try {
            const response = await api.post('/auth/login', { email, password });

            const { user, access_token } = response.data;

            // Map backend user to domain user if necessary
            const domainUser: User = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
            };

            await StorageService.setItem(TOKEN_STORAGE_KEY, access_token);
            await StorageService.setItem(USER_STORAGE_KEY, domainUser);

            Logger.info(`User logged in: ${email}`);
            return domainUser;
        } catch (error: any) {
            Logger.error('Login failed', error);

            if (error instanceof Error) {
                throw error;
            }

            const errorDetail =
                error &&
                typeof error === 'object' &&
                'response' in error &&
                error.response &&
                typeof error.response === 'object' &&
                'data' in error.response &&
                error.response.data &&
                typeof error.response.data === 'object' &&
                'detail' in error.response.data &&
                typeof error.response.data.detail === 'string'
                    ? error.response.data.detail
                    : null;

            if (errorDetail) {
                throw new NetworkError(errorDetail);
            }

            throw new NetworkError('Login failed');
        }
    }

    async logout(): Promise<void> {
        await clearStoredAuth();
        Logger.info('User logged out');
    }

    async getCurrentUser(): Promise<User | null> {
        const token = await getStoredToken();

        if (!token) {
            await clearStoredAuth();
            return null;
        }

        return await StorageService.getItem<User>(USER_STORAGE_KEY);
    }

    async getDemoCredentials(): Promise<DemoCredential[]> {
        try {
            const response = await api.get('/auth/demo-credentials');
            return response.data.credentials;
        } catch (error) {
            Logger.error('Failed to fetch demo credentials', error);
            // Fallback to local mocks if backend is down for any reason during demo
            return [
                {
                    role: "Admin",
                    icon: "person",
                    email: "admin@myuser.com",
                    password: "admin123",
                    description: "Core Roles (Offline Mock)"
                },
                {
                    role: "Teacher",
                    icon: "school",
                    email: "teacher@myuser.com",
                    password: "teacher123",
                    description: "Core Roles (Offline Mock)"
                },
            ];
        }
    }
}


