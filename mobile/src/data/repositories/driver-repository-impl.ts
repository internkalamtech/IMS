import { api } from '@/core/api-client';
<<<<<<< HEAD
=======
import { getAuthHeaders, getStoredToken } from '@/core/auth-storage';
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
import { Logger } from '@/core/logger';
import { ComplianceDocument } from '@/domain/entities/compliance-document';
import { MaintenanceTask } from '@/domain/entities/maintenance-task';
import { DriverRepository } from '@/domain/repositories/driver-repository';

export class DriverRepositoryImpl implements DriverRepository {
    async getDocuments(): Promise<ComplianceDocument[]> {
        try {
<<<<<<< HEAD
            const response = await api.get<ComplianceDocument[]>('/driver/documents');
=======
            await this.ensureToken();
            const response = await api.get<ComplianceDocument[]>('/driver/documents', {
                headers: await getAuthHeaders(),
            });
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            Logger.error('Failed to fetch driver documents', error);
            throw error;
        }
    }

    async getMaintenanceTasks(): Promise<MaintenanceTask[]> {
        try {
<<<<<<< HEAD
            const response = await api.get<MaintenanceTask[]>('/driver/maintenance');
=======
            await this.ensureToken();
            const response = await api.get<MaintenanceTask[]>('/driver/maintenance', {
                headers: await getAuthHeaders(),
            });
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            Logger.error('Failed to fetch driver maintenance tasks', error);
            throw error;
        }
    }
<<<<<<< HEAD
=======

    private async ensureToken(): Promise<void> {
        const token = await getStoredToken();

        if (!token) {
            throw new Error('No token available');
        }
    }
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
}
