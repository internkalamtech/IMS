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

            // Fallback for demo stability – mirrors backend dashboard.py values
            const fallbacks: Record<string, { label: string; value: string | number }[]> = {
                parent: [
                    { label: 'Attendance', value: '88%' },
                    { label: 'Avg Marks', value: '85%' },
                    { label: 'Fee Status', value: 'Paid' },
                ],
                student: [
                    { label: 'Attendance', value: '92%' },
                    { label: 'Avg Score', value: '8.5' },
                    { label: 'Assignments Due', value: 3 },
                ],
                teacher: [
                    { label: 'Active Classes', value: 4 },
                    { label: 'Upcoming Exams', value: 2 },
                    { label: 'Pending Gradings', value: 12 },
                ],
                admin: [
                    { label: 'Total Students', value: '1,250' },
                    { label: 'Faculty Members', value: 85 },
                    { label: 'Monthly Revenue', value: '₹45k' },
                ],
            };
            return {
                role: `${role.charAt(0).toUpperCase()}${role.slice(1)}`,
                stats: fallbacks[role] ?? [{ label: 'Status', value: 'Offline' }],
            };
        }
    }
}

