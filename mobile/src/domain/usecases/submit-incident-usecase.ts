import { Incident, IncidentRepository, IncidentSeverity, IncidentType } from '@/domain/repositories/incident-repository';

export class SubmitIncidentUseCase {
    constructor(private incidentRepository: IncidentRepository) { }

    async execute(
        type: IncidentType,
        severity: IncidentSeverity,
        description: string,
        latitude?: number | null,
        longitude?: number | null,
    ): Promise<Incident> {
        return this.incidentRepository.submitIncident(type, severity, description, latitude, longitude);
    }
}
