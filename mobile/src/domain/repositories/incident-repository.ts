/**
 * Repository interface for Incidents.
 *
 * Defines the contract that any incident data source must implement.
 * Follows the same pattern as auth-repository.ts and user-repository.ts.
 */

import { Incident, IncidentSeverity, IncidentType } from '../entities/incident';

export interface IncidentRepository {
    createIncident(
        type: IncidentType,
        severity: IncidentSeverity,
        description: string,
    ): Promise<Incident>;

    getDriverIncidents(): Promise<Incident[]>;
}
