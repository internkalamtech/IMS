import { api } from '@/core/api-client';
import { Logger } from '@/core/logger';
import { DriverProfileModel, TripRouteModel } from '@/data/models/driver-workflow-models';
import { driverProfileStore, getRouteStore, setRouteStore } from '@/data/repositories/driver-workflow-store';
import { DriverProfile, TripRoute } from '@/domain/entities/driver-workflow';
import { DriverRepository } from '@/domain/repositories/driver-repository';

const isDriverWorkflowApiEnabled = process.env.EXPO_PUBLIC_DRIVER_WORKFLOW_API === 'true';

export class DriverRepositoryImpl implements DriverRepository {
    async getDriverProfile(driverId: string): Promise<DriverProfile> {
        if (!isDriverWorkflowApiEnabled) {
            return driverProfileStore.toEntity();
        }

        try {
            const response = await api.get(`/driver/${driverId}/profile`);
            return DriverProfileModel.fromJson(response.data).toEntity();
        } catch (error) {
            Logger.warn('Using local driver profile fallback', error);
            return driverProfileStore.toEntity();
        }
    }

    async getTripRoute(driverId: string): Promise<TripRoute> {
        if (!isDriverWorkflowApiEnabled) {
            return getRouteStore().toEntity();
        }

        try {
            const response = await api.get(`/driver/${driverId}/route`);
            const route = TripRouteModel.fromJson(response.data);
            setRouteStore(route);
            return route.toEntity();
        } catch (error) {
            Logger.warn('Using local trip route fallback', error);
            return getRouteStore().toEntity();
        }
    }
}
