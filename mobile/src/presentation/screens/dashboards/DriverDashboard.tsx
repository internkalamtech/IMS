import { useDriverTrip } from '@/presentation/hooks/useDriverTrip';
import { ActiveTripPage } from '@/presentation/screens/driver/ActiveTripPage';
import { DriverDashboardPage } from '@/presentation/screens/driver/DriverDashboardPage';
import React, { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';

type DriverPageMode = 'dashboard' | 'activeTrip';

export default function DriverDashboard() {
    const {
        dashboardState,
        studentsState,
        startingTrip,
        checkingIn,
        endingTrip,
        loadDashboard,
        startTrip,
        checkInAtStop,
        endTrip,
    } = useDriverTrip();

    const [mode, setMode] = useState<DriverPageMode>('dashboard');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (dashboardState.status === 'loaded' && dashboardState.data.session.isActive) {
            setMode('activeTrip');
        }
        if (dashboardState.status === 'loaded' && !dashboardState.data.session.isActive) {
            setMode('dashboard');
        }
    }, [dashboardState]);

    useEffect(() => {
        const onBackPress = () => {
            if (mode === 'activeTrip') {
                setMode('dashboard');
                return true;
            }
            return false;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
    }, [mode]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboard();
        setRefreshing(false);
    };

    const onStartTrip = async () => {
        const started = await startTrip();
        if (started) {
            setMode('activeTrip');
        }
    };

    const onEndTrip = async () => {
        const ended = await endTrip();
        if (ended) {
            setMode('dashboard');
        }
    };

    if (mode === 'activeTrip' && dashboardState.status === 'loaded') {
        return (
            <ActiveTripPage
                data={dashboardState.data}
                students={studentsState.status === 'loaded' ? studentsState.data : []}
                checkingIn={checkingIn}
                endingTrip={endingTrip}
                refreshing={refreshing}
                onRefresh={onRefresh}
                onCheckInAtStop={async () => {
                    await checkInAtStop();
                }}
                onEndTrip={onEndTrip}
            />
        );
    }

    return (
        <DriverDashboardPage
            data={dashboardState.status === 'loaded' ? dashboardState.data : null}
            loading={dashboardState.status === 'loading'}
            refreshing={refreshing}
            startingTrip={startingTrip}
            errorMessage={dashboardState.status === 'error' ? dashboardState.message : undefined}
            onRefresh={onRefresh}
            onStartTrip={onStartTrip}
        />
    );
}
