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
            
            // Fallback to local mock if backend is unreachable or offline
            if (!error.response || error.message.includes('No response')) {
                Logger.warn('[Auth] Backend unreachable — using offline mock fallback. API calls WILL fail.');
                
                let role: 'admin' | 'teacher' | 'student' | 'parent' | 'driver' | 'transport' = 'admin';
                if (email.includes('teacher')) role = 'teacher';
                else if (email.includes('student')) role = 'student';
                else if (email.includes('parent')) role = 'parent';
                else if (email.includes('driver')) role = 'driver';
                else if (email.includes('transport')) role = 'transport';
                
                const mockUser: User = {
                    id: `mock-${role}-123`,
                    name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)} (Offline)`,
                    email: email,
                    role: role as any,
                    avatarUrl: undefined,
                };

                await StorageService.setItem(TOKEN_STORAGE_KEY, `mock-token-${role}`);
                await StorageService.setItem(USER_STORAGE_KEY, mockUser);
                
                return mockUser;
            }

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
                {
                    role: "Parent",
                    icon: "people",
                    email: "parent@myuser.com",
                    password: "parent123",
                    description: "Core Roles (Offline Mock)"
                },
                {
                    role: "Student",
                    icon: "school-outline",
                    email: "student@myuser.com",
                    password: "student123",
                    description: "Core Roles (Offline Mock)"
                },
            ];
        }
    }
}


