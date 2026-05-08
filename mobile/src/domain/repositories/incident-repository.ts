export type IncidentType = 'Breakdown' | 'Accident' | 'Delay';
export type IncidentSeverity = 'Low' | 'Medium' | 'High';

export interface Incident {
    id: string;
    driverId: number;
    type: IncidentType;
    severity: IncidentSeverity;
    description: string;
    latitude?: number | null;
    longitude?: number | null;
    createdAt: string;
}

export interface IncidentRepository {
    submitIncident(
        type: IncidentType,
        severity: IncidentSeverity,
        description: string,
        latitude?: number | null,
        longitude?: number | null,
    ): Promise<Incident>;
    getIncidents(): Promise<Incident[]>;
}
