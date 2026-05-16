import { StudentInfo } from '@/domain/entities/driver-workflow';
import { TripRepository } from '@/domain/repositories/trip-repository';

export class GetStudentsAtNextStopUseCase {
    constructor(private tripRepository: TripRepository) {}

    async execute(routeId: string, stopId: string): Promise<StudentInfo[]> {
        return this.tripRepository.getStudentsAtNextStop(routeId, stopId);
    }
}
