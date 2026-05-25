import { ComplianceDocument } from '../entities/compliance-document';

export interface ComplianceDocumentRepository {
    getComplianceDocuments(branch?: string, scope?: string): Promise<ComplianceDocument[]>;
    uploadComplianceDocument(
        document: Partial<ComplianceDocument>,
        file: any
    ): Promise<ComplianceDocument>;
    updateComplianceDocument(
        id: number,
        document: Partial<ComplianceDocument>,
        file?: any
    ): Promise<ComplianceDocument>;
}
