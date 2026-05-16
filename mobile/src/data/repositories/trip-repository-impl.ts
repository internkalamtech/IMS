import { api } from '@/core/api-client';
import { Logger } from '@/core/logger';
import { RouteStopModel, TripRouteModel, TripSessionModel } from '@/data/models/driver-workflow-models';
import {
    findCurrentStopId,
    getRouteStore,
    getSessionStore,
    getStudentsForStop,
    setRouteStore,
    setSessionStore,
} from '@/data/repositories/driver-workflow-store';
import { StopStatus, StudentInfo, TripSession } from '@/domain/entities/driver-workflow';
import { TripRepository } from '@/domain/repositories/trip-repository';

const isDriverWorkflowApiEnabled = process.env.EXPO_PUBLIC_DRIVER_WORKFLOW_API === 'true';

function moveToNextStop(route: TripRouteModel): TripRouteModel {
    const nextStops = route.stops.map((stop) => new RouteStopModel(
        stop.stopId,
        stop.stopName,
        stop.studentCount,
        stop.scheduledTime,
        stop.status,
    ));

    const currentIndex = nextStops.findIndex((stop) => stop.status === StopStatus.Current);
    if (currentIndex === -1) {
        return route;
    }

    nextStops[currentIndex].status = StopStatus.Completed;
    const upcomingIndex = nextStops.findIndex((stop, index) => index > currentIndex && stop.status === StopStatus.Upcoming);
    if (upcomingIndex !== -1) {
        nextStops[upcomingIndex].status = StopStatus.Current;
    }

    return new TripRouteModel(route.routeId, route.routeName, nextStops);
}

function completedStopsCount(route: TripRouteModel): number {
    return route.stops.filter((stop) => stop.status === StopStatus.Completed).length;
}

export class TripRepositoryImpl implements TripRepository {
    async startTrip(driverId: string, routeId: string): Promise<TripSession> {
        if (!isDriverWorkflowApiEnabled) {
            const session = getSessionStore();
            session.isActive = true;
            setSessionStore(session);
            return session.toEntity();
        }

        try {
            const response = await api.post('/driver/trips/start', { driverId, routeId });
            const session = TripSessionModel.fromJson(response.data);
            setSessionStore(session);
            return session.toEntity();
        } catch (error) {
            Logger.warn('Using local start trip fallback', error);
            const session = getSessionStore();
            session.isActive = true;
            setSessionStore(session);
            return session.toEntity();
        }
    }

    async getActiveSession(driverId: string): Promise<TripSession | null> {
        if (!isDriverWorkflowApiEnabled) {
            const session = getSessionStore();
            if (!session.isActive) {
                return null;
            }
            return session.toEntity();
        }

        try {
            const response = await api.get(`/driver/${driverId}/trips/active`);
            const session = TripSessionModel.fromJson(response.data);
            setSessionStore(session);
            return session.toEntity();
        } catch (error) {
            Logger.warn('Using local active session fallback', error);
            const session = getSessionStore();
            if (!session.isActive) {
                return null;
            }
            return session.toEntity();
        }
    }

    async checkInAtStop(tripId: string): Promise<TripSession> {
        if (!isDriverWorkflowApiEnabled) {
            const currentRoute = getRouteStore();
            const updatedRoute = moveToNextStop(currentRoute);
            setRouteStore(updatedRoute);

            const session = getSessionStore();
            session.completedStops = completedStopsCount(updatedRoute);
            session.studentsBoarded = Math.min(session.totalStudents, session.studentsBoarded + 1);
            session.isActive = session.completedStops < session.totalStops;
            setSessionStore(session);

            return session.toEntity();
        }

        try {
            const response = await api.post(`/driver/trips/${tripId}/check-in`);
            const session = TripSessionModel.fromJson(response.data);
            setSessionStore(session);
            return session.toEntity();
        } catch (error) {
            Logger.warn('Using local check-in fallback', error);
            const currentRoute = getRouteStore();
            const updatedRoute = moveToNextStop(currentRoute);
            setRouteStore(updatedRoute);

            const session = getSessionStore();
            session.completedStops = completedStopsCount(updatedRoute);
            session.studentsBoarded = Math.min(session.totalStudents, session.studentsBoarded + 1);
            session.isActive = session.completedStops < session.totalStops;
            setSessionStore(session);

            return session.toEntity();
        }
    }

    async getStudentsAtNextStop(routeId: string, stopId: string): Promise<StudentInfo[]> {
        if (!isDriverWorkflowApiEnabled) {
            const resolvedStopId = stopId || findCurrentStopId();
            return getStudentsForStop(resolvedStopId).map((student) => student.toEntity());
        }

        try {
            const response = await api.get(`/driver/routes/${routeId}/stops/${stopId}/students`);
            const data = Array.isArray(response.data) ? response.data : [];
            return data.map((item: any) => ({
                studentId: String(item.studentId),
                name: String(item.name),
                className: String(item.className),
                rollNumber: String(item.rollNumber),
                parentName: String(item.parentName),
                parentPhone: String(item.parentPhone),
            }));
        } catch (error) {
            Logger.warn('Using local students list fallback', error);
            const resolvedStopId = stopId || findCurrentStopId();
            return getStudentsForStop(resolvedStopId).map((student) => student.toEntity());
        }
    }

    async endTrip(tripId: string): Promise<TripSession> {
        if (!isDriverWorkflowApiEnabled) {
            const session = getSessionStore();
            session.isActive = false;
            setSessionStore(session);
            return session.toEntity();
        }

        try {
            const response = await api.post(`/driver/trips/${tripId}/end`);
            const session = TripSessionModel.fromJson(response.data);
            setSessionStore(session);
            return session.toEntity();
        } catch (error) {
            Logger.warn('Using local end trip fallback', error);
            const session = getSessionStore();
            session.isActive = false;
            setSessionStore(session);
            return session.toEntity();
        }
    }
}
