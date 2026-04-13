import { ComplianceDocument } from '@/domain/entities/compliance-document';
import { DriverRepository } from '@/domain/repositories/driver-repository';

export class GetDriverDocumentsUseCase {
    constructor(private readonly driverRepository: DriverRepository) {}

    async execute(): Promise<ComplianceDocument[]> {
        return this.driverRepository.getDocuments();
    }
}
