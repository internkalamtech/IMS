/**
 * Incident entity.
 *
 * Represents an incident reported by a driver,
 * such as a vehicle breakdown, accident, or delay.
 */

export type IncidentType = 'breakdown' | 'accident' | 'delay';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'acknowledged' | 'resolved';

export interface Incident {
    id: string;
    driver_id: string;
    type: IncidentType;
    severity: IncidentSeverity;
    description: string;
    status: IncidentStatus;
    created_at?: string;
}
