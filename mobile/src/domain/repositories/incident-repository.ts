export type IncidentType = 'Breakdown' | 'Accident' | 'Delay';
export type IncidentSeverity = 'Low' | 'Medium' | 'High';

export interface Incident {
    id: string;
    type: IncidentType;
    severity: IncidentSeverity;
    description: string;
    createdAt: string;
}

export interface IncidentRepository {
    submitIncident(type: IncidentType, severity: IncidentSeverity, description: string): Promise<Incident>;
    getIncidents(): Promise<Incident[]>;
}
