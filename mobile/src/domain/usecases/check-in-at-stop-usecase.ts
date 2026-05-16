import { TripSession } from '@/domain/entities/driver-workflow';
import { TripRepository } from '@/domain/repositories/trip-repository';

export class CheckInAtStopUseCase {
    constructor(private tripRepository: TripRepository) {}

    async execute(tripId: string): Promise<TripSession> {
        return this.tripRepository.checkInAtStop(tripId);
    }
}
