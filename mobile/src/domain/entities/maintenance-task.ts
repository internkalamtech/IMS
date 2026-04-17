<<<<<<< HEAD
export type MaintenanceStatus = 'Scheduled' | 'In Progress' | 'Completed';

export interface MaintenanceTask {
    title: string;
    date: string;
    status: MaintenanceStatus;
=======
export interface MaintenanceTask {
    title: string;
    date: string;
    status: 'Scheduled' | 'In Progress' | 'Completed';
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
}
