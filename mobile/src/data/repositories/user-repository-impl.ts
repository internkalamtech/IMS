import { api } from '@/core/api-client';
import { Logger } from '@/core/logger';
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