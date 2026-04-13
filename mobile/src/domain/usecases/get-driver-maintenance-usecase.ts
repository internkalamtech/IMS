import { MaintenanceTask } from '@/domain/entities/maintenance-task';
import { DriverRepository } from '@/domain/repositories/driver-repository';

export class GetDriverMaintenanceUseCase {
    constructor(private driverRepository: DriverRepository) {}

    async execute(): Promise<MaintenanceTask[]> {
        return this.driverRepository.getMaintenanceTasks();
    }
}
