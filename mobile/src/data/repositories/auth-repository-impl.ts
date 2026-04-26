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
                Logger.info('Using offline fallback for login');
                
                let role: 'admin' | 'teacher' | 'student' | 'parent' = 'admin';
                if (email.includes('teacher')) role = 'teacher';
                else if (email.includes('student')) role = 'student';
                else if (email.includes('parent')) role = 'parent';
                
                const mockUser: User = {
                    id: `mock-${role}-123`,
                    name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
                    email: email,
                    role: role,
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

    /** Validates credentials against local demo accounts when the backend is offline. */
    private async _offlineMockLogin(email: string, password: string): Promise<User> {
        const MOCK_USERS: Record<string, { name: string; role: User['role']; password: string }> = {
            'admin@myuser.com':     { name: 'Admin User',     role: 'admin',     password: 'admin123' },
            'teacher@myuser.com':   { name: 'Teacher User',   role: 'teacher',   password: 'teacher123' },
            'parent@myuser.com':    { name: 'Parent User',    role: 'parent',    password: 'parent123' },
            'student@myuser.com':   { name: 'Student User',  role: 'student',   password: 'student123' },
            'transport@myuser.com': { name: 'Transport User', role: 'transport', password: 'transport123' },
            'driver@myuser.com':    { name: 'Driver User',    role: 'driver',    password: 'driver123' },
        };

        const match = MOCK_USERS[email.toLowerCase()];
        if (!match || match.password !== password) {
            throw new NetworkError('Invalid email or password (offline mode)');
        }

        const mockUser: User = {
            id: `offline-${match.role}`,
            name: match.name,
            email: email.toLowerCase(),
            role: match.role,
            avatarUrl: undefined,
        };

        await StorageService.setItem(TOKEN_STORAGE_KEY, `offline-mock-token-${match.role}`);
        await StorageService.setItem(USER_STORAGE_KEY, mockUser);

        Logger.warn(`[Offline Mode] Logged in as ${email} without backend.`);
        return mockUser;
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
                {
                    role: "Transport",
                    icon: "bus",
                    email: "transport@myuser.com",
                    password: "transport123",
                    description: "Transport Roles (Offline Mock)"
                },
                {
                    role: "Driver",
                    icon: "car-sport",
                    email: "driver@myuser.com",
                    password: "driver123",
                    description: "Transport Roles (Offline Mock)"
                },
            ];
        }
    }
}


