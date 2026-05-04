import { ComplianceDocument } from '../entities/compliance-document';
import { ComplianceDocumentRepository } from '../repositories/compliance-document-repository';

export class GetComplianceDocumentsUseCase {
    constructor(private repository: ComplianceDocumentRepository) {}

    async execute(branch?: string, scope?: string): Promise<ComplianceDocument[]> {
        return this.repository.getComplianceDocuments(branch, scope);
    }
}
