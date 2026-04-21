import { StudentInfo, TripSession } from '@/domain/entities/driver-workflow';

export interface TripRepository {
    startTrip(driverId: string, routeId: string): Promise<TripSession>;
    getActiveSession(driverId: string): Promise<TripSession | null>;
    checkInAtStop(tripId: string): Promise<TripSession>;
    getStudentsAtNextStop(routeId: string, stopId: string): Promise<StudentInfo[]>;
    endTrip(tripId: string): Promise<TripSession>;
}
