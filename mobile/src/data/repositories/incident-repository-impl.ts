import { Incident, IncidentRepository, IncidentSeverity, IncidentType } from '@/domain/repositories/incident-repository';

// In-memory store for demo stability since this is a frontend-only task
let incidentsStore: Incident[] = [];

export class IncidentRepositoryImpl implements IncidentRepository {
    async submitIncident(type: IncidentType, severity: IncidentSeverity, description: string): Promise<Incident> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const newIncident: Incident = {
            id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
            type,
            severity,
            description,
            createdAt: new Date().toISOString(),
        };

        // Add to beginning of array
        incidentsStore = [newIncident, ...incidentsStore];
        
        return newIncident;
    }

    async getIncidents(): Promise<Incident[]> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return [...incidentsStore];
    }
}
