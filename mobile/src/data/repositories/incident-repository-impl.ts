/**
 * Implementation of IncidentRepository using the API client.
 *
 * Follows the same pattern as auth-repository-impl.ts and
 * user-repository-impl.ts, including offline fallbacks.
 */

import { api } from '@/core/api-client';
import { Logger } from '@/core/logger';
import { Incident, IncidentSeverity, IncidentType } from '@/domain/entities/incident';
import { IncidentRepository } from '@/domain/repositories/incident-repository';

export class IncidentRepositoryImpl implements IncidentRepository {
    async createIncident(
        type: IncidentType,
        severity: IncidentSeverity,
        description: string,
    ): Promise<Incident> {
        try {
            const response = await api.post('/incidents', {
                type,
                severity,
                description,
            });
            return response.data;
        } catch (error) {
            Logger.error('Failed to create incident', error);
            throw error;
        }
    }

    async getDriverIncidents(): Promise<Incident[]> {
        try {
            const response = await api.get('/incidents');
            return response.data.incidents;
        } catch (error) {
            Logger.error('Failed to fetch incidents', error);

            // Fallback for demo stability
            return [];
        }
    }
}
