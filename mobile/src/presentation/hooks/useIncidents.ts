import { IncidentRepositoryImpl } from '@/data/repositories/incident-repository-impl';
import { Incident, IncidentSeverity, IncidentType } from '@/domain/repositories/incident-repository';
import { GetIncidentsUseCase } from '@/domain/usecases/get-incidents-usecase';
import { SubmitIncidentUseCase } from '@/domain/usecases/submit-incident-usecase';
import { useCallback, useEffect, useState } from 'react';

// Single instance for in-memory persistence across hook usages
const incidentRepository = new IncidentRepositoryImpl();
const getIncidentsUseCase = new GetIncidentsUseCase(incidentRepository);
const submitIncidentUseCase = new SubmitIncidentUseCase(incidentRepository);

export function useIncidents() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchIncidents = useCallback(async () => {
        setError(null);
        try {
            const data = await getIncidentsUseCase.execute();
            setIncidents(data);
        } catch (e) {
            setError('Failed to fetch incidents');
            console.error(e);
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await fetchIncidents();
            setLoading(false);
        };
        load();
    }, [fetchIncidents]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchIncidents();
        setRefreshing(false);
    };

    const submitIncident = async (type: IncidentType, severity: IncidentSeverity, description: string) => {
        setSubmitting(true);
        setError(null);
        try {
            await submitIncidentUseCase.execute(type, severity, description);
            await fetchIncidents(); // Refresh the list after submission
            return true;
        } catch (e) {
            setError('Failed to submit incident');
            console.error(e);
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    return {
        incidents,
        loading,
        refreshing,
        submitting,
        error,
        onRefresh,
        submitIncident,
    };
}
