import { api } from '@/core/api-client';
import { Logger } from '@/core/logger';
import { ComplianceDocument } from '@/domain/entities/compliance-document';
import { MaintenanceTask } from '@/domain/entities/maintenance-task';
import { DriverRepository } from '@/domain/repositories/driver-repository';

export class DriverRepositoryImpl implements DriverRepository {
    async getDocuments(): Promise<ComplianceDocument[]> {
        try {
            const response = await api.get<ComplianceDocument[]>('/driver/documents');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            Logger.error('Failed to fetch driver documents', error);
            throw error;
        }
    }

    async getMaintenanceTasks(): Promise<MaintenanceTask[]> {
        try {
            const response = await api.get<MaintenanceTask[]>('/driver/maintenance');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            Logger.error('Failed to fetch driver maintenance tasks', error);
            throw error;
        }
    }
}
