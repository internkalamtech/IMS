import { ComplianceDocument } from '../entities/compliance-document';
import { ComplianceDocumentRepository } from '../repositories/compliance-document-repository';

export class UpdateComplianceDocumentUseCase {
    constructor(private repository: ComplianceDocumentRepository) { }

    async execute(id: number, document: Partial<ComplianceDocument>, file?: any): Promise<ComplianceDocument> {
        return this.repository.updateComplianceDocument(id, document, file);
    }
}
