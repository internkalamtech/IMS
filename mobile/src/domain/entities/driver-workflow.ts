export enum StopStatus {
    Completed = 'completed',
    Current = 'current',
    Upcoming = 'upcoming',
}

export interface DriverProfile {
    id: string;
    name: string;
    busNumber: string;
    busId: string;
}

export interface RouteStop {
    stopId: string;
    stopName: string;
    studentCount: number;
    scheduledTime: string;
    status: StopStatus;
}

export interface TripRoute {
    routeId: string;
    routeName: string;
    stops: RouteStop[];
}

export interface StudentInfo {
    studentId: string;
    name: string;
    className: string;
    rollNumber: string;
    parentName: string;
    parentPhone: string;
}

export interface TripSession {
    tripId: string;
    driverId: string;
    routeId: string;
    studentsBoarded: number;
    totalStudents: number;
    completedStops: number;
    totalStops: number;
    isActive: boolean;
}
