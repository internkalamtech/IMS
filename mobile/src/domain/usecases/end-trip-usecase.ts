import { TripSession } from '@/domain/entities/driver-workflow';
import { TripRepository } from '@/domain/repositories/trip-repository';

export class EndTripUseCase {
    constructor(private tripRepository: TripRepository) {}

    async execute(tripId: string): Promise<TripSession> {
        return this.tripRepository.endTrip(tripId);
    }
}
