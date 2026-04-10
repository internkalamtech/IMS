import { Incident, IncidentRepository } from '@/domain/repositories/incident-repository';

export class GetIncidentsUseCase {
    constructor(private incidentRepository: IncidentRepository) { }

    async execute(): Promise<Incident[]> {
        return this.incidentRepository.getIncidents();
    }
}
