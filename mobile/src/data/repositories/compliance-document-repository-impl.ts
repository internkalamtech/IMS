import { api } from '@/core/api-client';
import { Logger } from '@/core/logger';
import { ComplianceDocument } from '@/domain/entities/compliance-document';
import { ComplianceDocumentRepository } from '@/domain/repositories/compliance-document-repository';

export class ComplianceDocumentRepositoryImpl implements ComplianceDocumentRepository {
    async getComplianceDocuments(branch?: string, scope?: string): Promise<ComplianceDocument[]> {
        try {
            const params = new URLSearchParams();
            if (branch) params.append('branch', branch);
            if (scope) params.append('scope', scope);
            
            const queryString = params.toString() ? `?${params.toString()}` : '';
            const response = await api.get(`/documents${queryString}`);
            
            // Map the API response to the domain entity
            return response.data.map((doc: any) => ({
                id: doc.id,
                title: doc.title,
                branch: doc.branch,
                scope: doc.scope,
                originalFilename: doc.original_filename,
                uploadDate: doc.upload_date,
                expiryDate: doc.expiry_date,
                status: doc.status,
                daysLeft: doc.days_left,
            }));
        } catch (error) {
            Logger.error('Failed to fetch compliance documents', error);
            throw error;
        }
    }
}
