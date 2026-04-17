import { api } from '@/core/api-client';
import { getAuthHeaders, getStoredToken } from '@/core/auth-storage';
import { Logger } from '@/core/logger';
import { ComplianceDocument } from '@/domain/entities/compliance-document';
import { MaintenanceTask } from '@/domain/entities/maintenance-task';
import { DriverRepository } from '@/domain/repositories/driver-repository';

export class DriverRepositoryImpl implements DriverRepository {
    async getDocuments(): Promise<ComplianceDocument[]> {
        try {
            await this.ensureToken();
            const response = await api.get<ComplianceDocument[]>('/driver/documents', {
                headers: await getAuthHeaders(),
            });
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            Logger.error('Failed to fetch driver documents', error);
            throw error;
        }
    }

    async getMaintenanceTasks(): Promise<MaintenanceTask[]> {
        try {
            await this.ensureToken();
            const response = await api.get<MaintenanceTask[]>('/driver/maintenance', {
                headers: await getAuthHeaders(),
            });
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            Logger.error('Failed to fetch driver maintenance tasks', error);
            throw error;
        }
    }

    private async ensureToken(): Promise<void> {
        const token = await getStoredToken();

        if (!token) {
            throw new Error('No token available');
        }
    }
}
