/**
 * Use case for creating a new incident report.
 *
 * Validates the input and delegates to the repository.
 * Follows the same pattern as login-usecase.ts.
 */

import { ValidationError } from '@/core/error';
import { Incident, IncidentSeverity, IncidentType } from '../entities/incident';
import { IncidentRepository } from '../repositories/incident-repository';

export class CreateIncidentUseCase {
    constructor(private incidentRepository: IncidentRepository) { }

    async execute(
        type: IncidentType,
        severity: IncidentSeverity,
        description: string,
    ): Promise<Incident> {
        if (!description || !description.trim()) {
            throw new ValidationError('Incident description is required');
        }

        return this.incidentRepository.createIncident(type, severity, description.trim());
    }
}
