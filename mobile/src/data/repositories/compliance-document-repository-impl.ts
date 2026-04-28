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
            console.log("Documents API response:", response.status, response.data);

            return response.data.map((doc: any) => this.mapToEntity(doc));
        } catch (error: any) {
            Logger.error('Failed to fetch compliance documents', error);
            throw new Error(error.message || 'Failed to fetch compliance documents');
        }
    }

    async uploadComplianceDocument(document: Partial<ComplianceDocument>, file: any): Promise<ComplianceDocument> {
        try {
            const formData = new FormData();
            formData.append('title', document.type || '');
            formData.append('branch', document.vehicleName || '');
            formData.append('scope', document.documentNumber || '');
            formData.append('expiry_date', document.expiryDate || '');
            if (file) {
                formData.append('file', file as any);
            }

            const response = await api.post('/documents/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Map back to ComplianceDocument, similar to get
            const doc = response.data;
            return this.mapToEntity(doc);
        } catch (error) {
            Logger.error('Failed to upload compliance document', error);
            throw error;
        }
    }

    async updateComplianceDocument(id: number, document: Partial<ComplianceDocument>, file?: any): Promise<ComplianceDocument> {
        try {
            const formData = new FormData();
            if (document.type) formData.append('title', document.type);
            if (document.vehicleName) formData.append('branch', document.vehicleName);
            if (document.documentNumber) formData.append('scope', document.documentNumber);
            if (document.expiryDate) formData.append('expiry_date', document.expiryDate);
            if (file) {
                formData.append('file', file as any);
            }

            const response = await api.put(`/documents/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const doc = response.data;
            return this.mapToEntity(doc);
        } catch (error) {
            Logger.error('Failed to update compliance document', error);
            throw error;
        }
    }

    private mapToEntity(doc: any): ComplianceDocument {
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
    }
}
