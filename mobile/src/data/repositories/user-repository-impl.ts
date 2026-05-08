import { api } from '@/core/api-client';
import { Logger } from '@/core/logger';
import { ClassData, DashboardData, UserRepository } from '@/domain/repositories/user-repository';
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
    async getClasses(): Promise<ClassData[]> {
        return [
            { id: 1, name: "7A", section: "Section A", academicPeriodId: 1 },
            { id: 2, name: "7B", section: "Section A", academicPeriodId: 1 },
            { id: 3, name: "8A", section: "Section A", academicPeriodId: 1 },
            { id: 4, name: "8B", section: "Section A", academicPeriodId: 1 },
        ];
    }
}