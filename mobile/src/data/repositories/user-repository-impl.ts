import { api } from '@/core/api-client';
import { Logger } from '@/core/logger';
<<<<<<< HEAD
import { CreateUserInput, DashboardData, UserRepository } from '@/domain/repositories/user-repository';

=======
import { DashboardData, UserRepository } from '@/domain/repositories/user-repository';
>>>>>>> 108e7a58ce795d7ea23ae909095c1d92aad03e60
export class UserRepositoryImpl implements UserRepository {
    async getDashboardData(role: string): Promise<DashboardData> {
        try {
            const response = await api.get('/dashboard/stats');
            return response.data;
        } catch (error) {
            Logger.error('Failed to fetch dashboard data', error);
            return {
                role: `${role.charAt(0).toUpperCase()}${role.slice(1)} (Offline)`,
                stats: [
                    { label: "Offline Mode", value: "Active" },
                    { label: "Backend", value: "Unreachable" },
                ]
            };
        }
    }
<<<<<<< HEAD

    async createUser(userData: CreateUserInput): Promise<void> {
        try {
            await api.post('/users', userData);
            Logger.info('User created successfully', userData.email);
        } catch (error) {
            Logger.error('Failed to create user', error);
            throw error;
        }
    }
}

=======
}
>>>>>>> 108e7a58ce795d7ea23ae909095c1d92aad03e60
