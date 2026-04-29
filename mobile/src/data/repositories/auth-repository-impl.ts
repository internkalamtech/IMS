import { api } from '@/core/api-client';
import { NetworkError } from '@/core/error';
import { Logger } from '@/core/logger';
import { StorageService } from '@/data/local/storage';
import { DemoCredential } from '@/domain/entities/demo-credential';
import { User, UserRole } from '@/domain/entities/user';
import { AuthRepository } from '@/domain/repositories/auth-repository';

const USER_STORAGE_KEY = 'current_user';
const TOKEN_STORAGE_KEY = 'auth_token';

const OFFLINE_DEMO_CREDENTIALS: DemoCredential[] = [
    {
        role: 'Admin',
        icon: 'person',
        email: 'admin@myuser.com',
        password: 'admin123',
        description: 'Core Roles',
    },
    {
        role: 'Teacher',
        icon: 'school',
        email: 'teacher@myuser.com',
        password: 'teacher123',
        description: 'Core Roles',
    },
    {
        role: 'Parent',
        icon: 'people',
        email: 'parent@myuser.com',
        password: 'parent123',
        description: 'Core Roles',
    },
    {
        role: 'Student',
        icon: 'school-outline',
        email: 'student@myuser.com',
        password: 'student123',
        description: 'Core Roles',
    },
    {
        role: 'Transport',
        icon: 'bus',
        email: 'transport@myuser.com',
        password: 'transport123',
        description: 'Transport Roles',
    },
    {
        role: 'Driver',
        icon: 'car-sport',
        email: 'driver@myuser.com',
        password: 'driver123',
        description: 'Transport Roles',
    },
    {
        role: 'Parent',
        icon: 'people',
        email: 'john@myuser.com',
        password: 'john123',
        description: 'Multi-role Users',
    },
    {
        role: 'Teacher',
        icon: 'people',
        email: 'maria@myuser.com',
        password: 'maria123',
        description: 'Multi-role Users',
    },
];

const OFFLINE_TOKEN = 'offline-auth-token';

function normalize(value: string): string {
    return value.trim().toLowerCase();
}

function toUserRole(role: string): UserRole {
    return role.toLowerCase() as UserRole;
}

function createOfflineUser(credential: DemoCredential): User {
    return {
        id: `offline-${normalize(credential.email)}`,
        name: credential.role,
        email: credential.email,
        role: toUserRole(credential.role),
        avatarUrl: undefined,
    };
}

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

            const matchingCredential = OFFLINE_DEMO_CREDENTIALS.find(
                (credential) =>
                    normalize(credential.email) === normalize(email) &&
                    credential.password === password
            );

            if (matchingCredential) {
                const offlineUser = createOfflineUser(matchingCredential);
                await StorageService.setItem(TOKEN_STORAGE_KEY, OFFLINE_TOKEN);
                await StorageService.setItem(USER_STORAGE_KEY, offlineUser);
                Logger.warn(`Offline demo login used for ${email}`);
                return offlineUser;
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
            const credentials = response.data?.credentials;

            if (Array.isArray(credentials) && credentials.length > 0) {
                return credentials;
            }

            Logger.warn('Demo credentials endpoint returned no usable credentials; using offline fallback');
            return OFFLINE_DEMO_CREDENTIALS;
        } catch (error) {
            Logger.error('Failed to fetch demo credentials', error);
            // Fallback to local mocks if backend is down or returns an invalid payload.
            return OFFLINE_DEMO_CREDENTIALS;
        }
    }
}


