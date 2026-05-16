import { TripSession } from '@/domain/entities/driver-workflow';
import { TripRepository } from '@/domain/repositories/trip-repository';

export class StartTripUseCase {
    constructor(private tripRepository: TripRepository) {}

    async execute(driverId: string, routeId: string): Promise<TripSession> {
        return this.tripRepository.startTrip(driverId, routeId);
    }
}
