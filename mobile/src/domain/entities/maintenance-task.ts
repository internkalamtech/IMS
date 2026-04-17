export type MaintenanceStatus = 'Scheduled' | 'In Progress' | 'Completed';

export interface MaintenanceTask {
    title: string;
    date: string;
    status: MaintenanceStatus;
}
