import { ComplianceDocument } from '../entities/compliance-document';

export interface ComplianceDocumentRepository {
    getComplianceDocuments(branch?: string, scope?: string): Promise<ComplianceDocument[]>;
}
