import { ComplianceDocument } from '@/domain/entities/compliance-document';
import { MaintenanceTask } from '@/domain/entities/maintenance-task';

export interface DriverRepository {
    getDocuments(): Promise<ComplianceDocument[]>;
    getMaintenanceTasks(): Promise<MaintenanceTask[]>;
}
