import { DriverProfile, StopStatus, TripRoute, TripSession } from '@/domain/entities/driver-workflow';
import { DriverRepository } from '@/domain/repositories/driver-repository';
import { TripRepository } from '@/domain/repositories/trip-repository';

export interface DriverDashboardData {
    profile: DriverProfile;
    route: TripRoute;
    session: TripSession;
}

export class GetDriverDashboardUseCase {
    constructor(
        private driverRepository: DriverRepository,
        private tripRepository: TripRepository,
    ) {}

    async execute(driverId: string): Promise<DriverDashboardData> {
        const [profile, route, activeSession] = await Promise.all([
            this.driverRepository.getDriverProfile(driverId),
            this.driverRepository.getTripRoute(driverId),
            this.tripRepository.getActiveSession(driverId),
        ]);

        const completedStops = route.stops.filter((stop) => stop.status === StopStatus.Completed).length;
        const totalStops = route.stops.length;

        const fallbackSession: TripSession = {
            tripId: 'trip-local',
            driverId,
            routeId: route.routeId,
            studentsBoarded: 28,
            totalStudents: 32,
            completedStops,
            totalStops,
            isActive: false,
        };

        return {
            profile,
            route,
            session: activeSession ?? fallbackSession,
        };
    }
}
