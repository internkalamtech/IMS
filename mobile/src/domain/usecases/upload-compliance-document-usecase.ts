import { ComplianceDocument } from '../entities/compliance-document';
import { ComplianceDocumentRepository } from '../repositories/compliance-document-repository';

export class UploadComplianceDocumentUseCase {
    constructor(private repository: ComplianceDocumentRepository) { }

    async execute(document: Partial<ComplianceDocument>, file: any): Promise<ComplianceDocument> {
        return this.repository.uploadComplianceDocument(document, file);
    }
}
