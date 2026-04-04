import { api } from '@/core/api-client';
import { NetworkError } from '@/core/error';
import { Logger } from '@/core/logger';
import { StorageService } from '@/data/local/storage';
import { DemoCredential } from '@/domain/entities/demo-credential';
import { User } from '@/domain/entities/user';
import { AuthRepository } from '@/domain/repositories/auth-repository';

const USER_STORAGE_KEY = 'current_user';
const TOKEN_STORAGE_KEY = 'auth_token';

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
            if (error.response?.data?.detail) {
                throw new NetworkError(error.response.data.detail);
            }
            throw error;
        }
    }

    async logout(): Promise<void> {
        await StorageService.removeItem(USER_STORAGE_KEY);
        await StorageService.removeItem(TOKEN_STORAGE_KEY);
        Logger.info('User logged out');
    }

    async getCurrentUser(): Promise<User | null> {
        try {
            const token = await StorageService.getItem<string>(TOKEN_STORAGE_KEY);

            if (!token) {
                await StorageService.removeItem(USER_STORAGE_KEY);
                return null;
            }

            const response = await api.get('/auth/me');
            const user = response.data;

            const domainUser: User = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
            };

            await StorageService.setItem(USER_STORAGE_KEY, domainUser);
            return domainUser;
        } catch (error) {
            Logger.warn('Stored session is invalid or expired; clearing auth state');
            await StorageService.removeItem(USER_STORAGE_KEY);
            await StorageService.removeItem(TOKEN_STORAGE_KEY);
            return null;
        }
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

    async refreshToken(): Promise<string | null> {
        try {
            const token = await StorageService.getItem<string>(TOKEN_STORAGE_KEY);

            if (!token) {
                Logger.warn('No token available to refresh');
                return null;
            }

            const response = await api.post('/auth/refresh', { access_token: token });
            const { access_token } = response.data;

            await StorageService.setItem(TOKEN_STORAGE_KEY, access_token);
            Logger.info('Token refreshed successfully');
            return access_token;
        } catch (error: any) {
            Logger.error('Token refresh failed', error);
            // Clear auth state on refresh failure
            await StorageService.removeItem(USER_STORAGE_KEY);
            await StorageService.removeItem(TOKEN_STORAGE_KEY);
            return null;
        }
    }
}



