import { MaintenanceTask } from '@/domain/entities/maintenance-task';
import { DriverRepository } from '@/domain/repositories/driver-repository';

export class GetDriverMaintenanceUseCase {
<<<<<<< HEAD
    constructor(private readonly driverRepository: DriverRepository) {}
=======
    constructor(private driverRepository: DriverRepository) {}
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89

    async execute(): Promise<MaintenanceTask[]> {
        return this.driverRepository.getMaintenanceTasks();
    }
}
