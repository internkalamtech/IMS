import { TripSession } from '@/domain/entities/driver-workflow';
import { TripRepository } from '@/domain/repositories/trip-repository';

export class GetActiveSessionUseCase {
    constructor(private tripRepository: TripRepository) {}

    async execute(driverId: string): Promise<TripSession | null> {
        return this.tripRepository.getActiveSession(driverId);
    }
}
