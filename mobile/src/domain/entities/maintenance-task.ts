export interface MaintenanceTask {
    title: string;
    date: string;
    status: 'Scheduled' | 'In Progress' | 'Completed';
}
