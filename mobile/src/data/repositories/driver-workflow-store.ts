import {
    DriverProfileModel,
    RouteStopModel,
    StudentInfoModel,
    TripRouteModel,
    TripSessionModel,
} from '@/data/models/driver-workflow-models';
import { StopStatus } from '@/domain/entities/driver-workflow';

const defaultStops = [
    new RouteStopModel('stop-1', 'Green Valley Gate', 5, '7:15 AM', StopStatus.Completed),
    new RouteStopModel('stop-2', 'Shopping Complex', 8, '7:25 AM', StopStatus.Completed),
    new RouteStopModel('stop-3', 'Central Park', 6, '7:35 AM', StopStatus.Completed),
    new RouteStopModel('stop-4', 'City Hospital', 9, '7:42 AM', StopStatus.Completed),
    new RouteStopModel('stop-5', 'Park Avenue', 3, '7:50 AM', StopStatus.Current),
    new RouteStopModel('stop-6', 'Lake View', 4, '7:58 AM', StopStatus.Upcoming),
    new RouteStopModel('stop-7', 'Hill Station', 7, '8:06 AM', StopStatus.Upcoming),
    new RouteStopModel('stop-8', 'School Gate', 0, '8:15 AM', StopStatus.Upcoming),
];

const studentsByStop: Record<string, StudentInfoModel[]> = {
    'stop-5': [
        new StudentInfoModel('student-201', 'Aaray Kumar', 'Class 7A', '201', 'Mr. Kumar', '+91-9988776611'),
        new StudentInfoModel('student-145', 'Diya Sharma', 'Class 8B', '145', 'Mrs. Sharma', '+91-9911223344'),
        new StudentInfoModel('student-089', 'Rohan Verma', 'Class 6C', '089', 'Mr. Verma', '+91-9876543210'),
    ],
    'stop-6': [
        new StudentInfoModel('student-167', 'Sara Ali', 'Class 7B', '167', 'Mrs. Ali', '+91-9011223344'),
        new StudentInfoModel('student-233', 'Kabir Rao', 'Class 6A', '233', 'Mr. Rao', '+91-9900887766'),
    ],
};

let routeStore = new TripRouteModel('route-a', 'Route A - Green Valley', defaultStops);
let sessionStore = new TripSessionModel('trip-local', 'driver-001', 'route-a', 28, 32, 4, 12, false);

export const driverProfileStore = new DriverProfileModel('driver-001', 'Rajesh Kumar', 'BUS-001', 'bus-001');

export function getRouteStore(): TripRouteModel {
    return routeStore;
}

export function setRouteStore(route: TripRouteModel): void {
    routeStore = route;
}

export function getSessionStore(): TripSessionModel {
    return sessionStore;
}

export function setSessionStore(session: TripSessionModel): void {
    sessionStore = session;
}

export function getStudentsForStop(stopId: string): StudentInfoModel[] {
    return studentsByStop[stopId] ?? [];
}

export function findCurrentStopId(): string {
    const currentStop = routeStore.stops.find((stop) => stop.status === StopStatus.Current);
    return currentStop?.stopId ?? '';
}
