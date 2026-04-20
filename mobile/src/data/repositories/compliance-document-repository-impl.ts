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
            const response = await api.get(`/documents/${queryString}`);
            
            return response.data.map((doc: any) => {
                const expiryDate = new Date(doc.expiry_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const expiry = new Date(expiryDate);
                expiry.setHours(0, 0, 0, 0);
                
                const timeDiff = expiry.getTime() - today.getTime();
                const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                let status = 'Valid';
                if (daysLeft < 0) {
                    status = 'Expired';
                } else if (daysLeft <= 30) {
                    status = 'Expiring';
                }

                return {
                    id: doc.id,
                    type: doc.title,
                    vehicleName: doc.branch || 'N/A',
                    documentNumber: doc.scope || 'N/A',
                    issuedDate: doc.upload_date,
                    expiryDate: doc.expiry_date,
                    status: status,
                    daysLeft: daysLeft,
                    fileUrl: `/v1/documents/${doc.id}/download`,
                };
            });
        } catch (error) {
            Logger.error('Failed to fetch compliance documents', error);
            throw error;
        }
    }
}
