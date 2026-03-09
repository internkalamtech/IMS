import { api } from '@/core/api-client';
import { Logger } from '@/core/logger';
import { DashboardData, UserRepository } from '@/domain/repositories/user-repository';

export class UserRepositoryImpl implements UserRepository {
    async getDashboardData(role: string): Promise<DashboardData> {
        try {
            const response = await api.get('/dashboard/stats');
            return response.data;
        } catch (error) {
            Logger.error('Failed to fetch dashboard data', error);

            // Fallback for demo stability
            return {
                role: `${role.charAt(0).toUpperCase()}${role.slice(1)} (Offline)`,
                stats: [
                    { label: "Offline Mode", value: "Active" },
                    { label: "Backend", value: "Unreachable" },
                ]
            };
        }
    }
}

