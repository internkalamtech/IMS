/**
 * Custom hook for managing incident state.
 *
 * Handles loading, submitting, error states, and the list of incidents.
 * Follows the same pattern as useDashboard.ts.
 */

import { IncidentRepositoryImpl } from '@/data/repositories/incident-repository-impl';
import { Incident, IncidentSeverity, IncidentType } from '@/domain/entities/incident';
import { CreateIncidentUseCase } from '@/domain/usecases/create-incident-usecase';
import { GetDriverIncidentsUseCase } from '@/domain/usecases/get-driver-incidents-usecase';
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

const incidentRepository = new IncidentRepositoryImpl();
const createIncidentUseCase = new CreateIncidentUseCase(incidentRepository);
const getDriverIncidentsUseCase = new GetDriverIncidentsUseCase(incidentRepository);

export function useIncidents() {
    const { user } = useAuth();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchIncidents();
        }
    }, [user]);

    const fetchIncidents = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getDriverIncidentsUseCase.execute();
            setIncidents(data);
        } catch (e) {
            setError('Failed to load incidents');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const createIncident = async (
        type: IncidentType,
        severity: IncidentSeverity,
        description: string,
    ) => {
        setSubmitting(true);
        setError(null);
        try {
            const newIncident = await createIncidentUseCase.execute(type, severity, description);
            setIncidents((prev) => [newIncident, ...prev]);
            return newIncident;
        } catch (e: any) {
            setError(e.message || 'Failed to create incident');
            throw e;
        } finally {
            setSubmitting(false);
        }
    };

    return {
        incidents,
        loading,
        submitting,
        error,
        createIncident,
        refresh: fetchIncidents,
    };
}
