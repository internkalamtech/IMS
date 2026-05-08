import { api } from '@/core/api-client';
import { Logger } from '@/core/logger';
import { Incident, IncidentRepository, IncidentSeverity, IncidentType } from '@/domain/repositories/incident-repository';

export class IncidentRepositoryImpl implements IncidentRepository {
    /**
     * Submit a new incident report to the backend.
     * Maps to: POST /api/v1/incidents
     */
    async submitIncident(
        type: IncidentType,
        severity: IncidentSeverity,
        description: string,
        latitude?: number | null,
        longitude?: number | null,
    ): Promise<Incident> {
        try {
            const response = await api.post('/incidents', {
                type,
                severity,
                description,
                latitude: latitude ?? null,
                longitude: longitude ?? null,
            });

            const data = response.data;
            Logger.info(`Incident submitted successfully: ID=${data.id}`);

            return this._mapToIncident(data);
        } catch (error: any) {
            Logger.error('Failed to submit incident', error);
            throw error;
        }
    }

    /**
     * Retrieve all incidents reported by the authenticated driver.
     * Maps to: GET /api/v1/incidents/my
     */
    async getIncidents(): Promise<Incident[]> {
        try {
            const response = await api.get('/incidents/my');
            Logger.info(`Fetched ${response.data.length} incidents`);
            return response.data.map(this._mapToIncident);
        } catch (error: any) {
            Logger.error('Failed to fetch incidents', error);
            throw error;
        }
    }

    /**
     * Map a backend response object to the Incident domain type.
     */
    private _mapToIncident(data: any): Incident {
        return {
            id: String(data.id),
            driverId: data.driver_id,
            type: data.type as IncidentType,
            severity: data.severity as IncidentSeverity,
            description: data.description,
            latitude: data.latitude ?? null,
            longitude: data.longitude ?? null,
            createdAt: data.created_at,
        };
    }
}
