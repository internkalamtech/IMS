/**
 * Use case for retrieving all incidents for a driver.
 *
 * Follows the same pattern as get-dashboard-data-usecase.ts.
 */

import { Incident } from '../entities/incident';
import { IncidentRepository } from '../repositories/incident-repository';

export class GetDriverIncidentsUseCase {
    constructor(private incidentRepository: IncidentRepository) { }

    async execute(): Promise<Incident[]> {
        return this.incidentRepository.getDriverIncidents();
    }
}
