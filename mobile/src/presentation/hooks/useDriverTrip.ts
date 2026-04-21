import { DriverRepositoryImpl } from '@/data/repositories/driver-repository-impl';
import { TripRepositoryImpl } from '@/data/repositories/trip-repository-impl';
import { StopStatus } from '@/domain/entities/driver-workflow';
import { CheckInAtStopUseCase } from '@/domain/usecases/check-in-at-stop-usecase';
import { EndTripUseCase } from '@/domain/usecases/end-trip-usecase';
import { GetActiveSessionUseCase } from '@/domain/usecases/get-active-session-usecase';
import { GetDriverDashboardUseCase } from '@/domain/usecases/get-driver-dashboard-usecase';
import { GetStudentsAtNextStopUseCase } from '@/domain/usecases/get-students-at-next-stop-usecase';
import { StartTripUseCase } from '@/domain/usecases/start-trip-usecase';
import { useAuth } from '@/presentation/hooks/useAuth';
import { DriverDashboardState, StudentsAtStopState } from '@/presentation/state/driver-trip-state';
import { useCallback, useEffect, useState } from 'react';

const driverRepository = new DriverRepositoryImpl();
const tripRepository = new TripRepositoryImpl();

const getDriverDashboardUseCase = new GetDriverDashboardUseCase(driverRepository, tripRepository);
const startTripUseCase = new StartTripUseCase(tripRepository);
const getActiveSessionUseCase = new GetActiveSessionUseCase(tripRepository);
const checkInAtStopUseCase = new CheckInAtStopUseCase(tripRepository);
const getStudentsAtNextStopUseCase = new GetStudentsAtNextStopUseCase(tripRepository);
const endTripUseCase = new EndTripUseCase(tripRepository);

export function useDriverTrip() {
    const { user } = useAuth();
    const driverId = user?.id ?? 'driver-001';

    const [dashboardState, setDashboardState] = useState<DriverDashboardState>({ status: 'loading' });
    const [studentsState, setStudentsState] = useState<StudentsAtStopState>({ status: 'loading' });
    const [startingTrip, setStartingTrip] = useState(false);
    const [checkingIn, setCheckingIn] = useState(false);
    const [endingTrip, setEndingTrip] = useState(false);

    const loadDashboard = useCallback(async () => {
        setDashboardState({ status: 'loading' });
        try {
            const dashboard = await getDriverDashboardUseCase.execute(driverId);
            setDashboardState({ status: 'loaded', data: dashboard });
        } catch (error) {
            setDashboardState({ status: 'error', message: 'Failed to load driver dashboard.' });
            console.error(error);
        }
    }, [driverId]);

    const loadStudentsAtNextStop = useCallback(async () => {
        if (dashboardState.status !== 'loaded') {
            return;
        }

        const currentStop = dashboardState.data.route.stops.find((stop) => stop.status === StopStatus.Current);
        if (!currentStop) {
            setStudentsState({ status: 'loaded', data: [] });
            return;
        }

        setStudentsState({ status: 'loading' });
        try {
            const students = await getStudentsAtNextStopUseCase.execute(
                dashboardState.data.route.routeId,
                currentStop.stopId,
            );
            setStudentsState({ status: 'loaded', data: students });
        } catch (error) {
            setStudentsState({ status: 'error', message: 'Failed to load students for next stop.' });
            console.error(error);
        }
    }, [dashboardState]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    useEffect(() => {
        if (dashboardState.status === 'loaded' && dashboardState.data.session.isActive) {
            loadStudentsAtNextStop();
        }
    }, [dashboardState, loadStudentsAtNextStop]);

    const startTrip = async () => {
        if (dashboardState.status !== 'loaded') {
            return false;
        }

        setStartingTrip(true);
        try {
            await startTripUseCase.execute(driverId, dashboardState.data.route.routeId);
            await loadDashboard();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setStartingTrip(false);
        }
    };

    const checkInAtStop = async () => {
        if (dashboardState.status !== 'loaded') {
            return false;
        }

        setCheckingIn(true);
        try {
            await checkInAtStopUseCase.execute(dashboardState.data.session.tripId);
            await loadDashboard();
            await loadStudentsAtNextStop();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setCheckingIn(false);
        }
    };

    const endTrip = async () => {
        if (dashboardState.status !== 'loaded') {
            return false;
        }

        setEndingTrip(true);
        try {
            await endTripUseCase.execute(dashboardState.data.session.tripId);
            await loadDashboard();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setEndingTrip(false);
        }
    };

    const loadActiveSession = async () => {
        if (dashboardState.status !== 'loaded') {
            return null;
        }
        return getActiveSessionUseCase.execute(dashboardState.data.profile.id);
    };

    return {
        dashboardState,
        studentsState,
        startingTrip,
        checkingIn,
        endingTrip,
        loadDashboard,
        loadStudentsAtNextStop,
        loadActiveSession,
        startTrip,
        checkInAtStop,
        endTrip,
    };
}
