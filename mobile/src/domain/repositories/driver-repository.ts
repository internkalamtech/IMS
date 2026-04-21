import { DriverProfile, TripRoute } from '@/domain/entities/driver-workflow';

export interface DriverRepository {
    getDriverProfile(driverId: string): Promise<DriverProfile>;
    getTripRoute(driverId: string): Promise<TripRoute>;
}
