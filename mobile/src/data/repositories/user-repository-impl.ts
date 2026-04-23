import { api } from '@/core/api-client';
import { Logger } from '@/core/logger';
 feature/student-profile-ui
import {
  CreateUserInput,
  DashboardData,
  UserRepository,
} from '@/domain/repositories/user-repository';

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
          { label: 'Offline Mode', value: 'Active' },
          { label: 'Backend', value: 'Unreachable' },
        ],
      };
    }
  }

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
import { DashboardData, UserRepository } from '@/domain/repositories/user-repository';

const FALLBACK_STATS: Record<string, { label: string; value: string | number }[]> = {
    parent: [
        { label: 'Attendance', value: '88%' },
        { label: 'Avg Marks', value: '85%' },
        { label: 'Pending Homework', value: 5 },
        { label: 'Fee Status', value: 'Paid' },
    ],
    teacher: [
        { label: 'Active Classes', value: 4 },
        { label: 'Upcoming Exams', value: 2 },
        { label: 'Pending Gradings', value: 12 },
    ],
    student: [
        { label: 'Course Progress', value: '75%' },
        { label: 'Overall GPA', value: '3.8' },
        { label: 'Assignments Due', value: 3 },
    ],
    admin: [
        { label: 'Total Students', value: '1,250' },
        { label: 'Faculty Members', value: 85 },
        { label: 'Monthly Revenue', value: '$45k' },
    ],
};

export class UserRepositoryImpl implements UserRepository {
    async getDashboardData(role: string): Promise<DashboardData> {
        try {
            const response = await api.get('/dashboard/stats');
            return response.data;
        } catch (error) {
            Logger.error('Failed to fetch dashboard data', error);
            return {
                role: `${role.charAt(0).toUpperCase()}${role.slice(1)} (Offline)`,
                stats: FALLBACK_STATS[role] ?? [
                    { label: 'Offline Mode', value: 'Active' },
                    { label: 'Backend', value: 'Unreachable' },
                ],
            };
        }
    }
}
 main
