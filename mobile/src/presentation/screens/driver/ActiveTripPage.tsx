import { ColorPalettes } from '@/core/theme/tokens';
import { StopStatus, StudentInfo } from '@/domain/entities/driver-workflow';
import { DriverDashboardData } from '@/domain/usecases/get-driver-dashboard-usecase';
import { ThemedView } from '@/presentation/components/ThemedView';
import { DriverStatusCard } from '@/presentation/widgets/driver/DriverStatusCard';
import { NextStopCard } from '@/presentation/widgets/driver/NextStopCard';
import { StudentsAtNextStopList } from '@/presentation/widgets/driver/StudentsAtNextStopList';
import { TodaysRouteList } from '@/presentation/widgets/driver/TodaysRouteList';
import { TripActionButton } from '@/presentation/widgets/driver/TripActionButton';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

type ActiveTripPageProps = {
    data: DriverDashboardData;
    students: StudentInfo[];
    checkingIn: boolean;
    endingTrip: boolean;
    refreshing: boolean;
    onRefresh: () => Promise<void>;
    onCheckInAtStop: () => Promise<void>;
    onEndTrip: () => Promise<void>;
};

export function ActiveTripPage({
    data,
    students,
    checkingIn,
    endingTrip,
    refreshing,
    onRefresh,
    onCheckInAtStop,
    onEndTrip,
}: ActiveTripPageProps) {
    const currentStop = data.route.stops.find((stop) => stop.status === StopStatus.Current);
    const etaMinutes = currentStop ? 5 : 0;

    return (
        <ThemedView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <DriverStatusCard
                    profile={data.profile}
                    route={data.route}
                    session={data.session}
                    active
                />

                <View style={styles.rowButtons}>
                    <View style={styles.halfButton}>
                        <TripActionButton
                            title={endingTrip ? 'Ending...' : 'End Trip'}
                            iconName="stop-circle-outline"
                            backgroundColor={ColorPalettes.orange[500]}
                            disabled={endingTrip}
                            onPress={() => void onEndTrip()}
                        />
                    </View>

                    <View style={styles.halfButton}>
                        <TripActionButton
                            title="SOS"
                            iconName="alert-circle-outline"
                            backgroundColor={ColorPalettes.red[500]}
                            onPress={() => Alert.alert('Emergency', 'SOS signal has been raised.')}
                        />
                    </View>
                </View>

                <TripActionButton
                    title={checkingIn ? 'Checking in...' : 'Check-in at Stop'}
                    iconName="checkmark-circle-outline"
                    disabled={checkingIn}
                    onPress={() => void onCheckInAtStop()}
                />

                {currentStop ? <NextStopCard stop={currentStop} etaMinutes={etaMinutes} /> : null}

                {students.length > 0 ? <StudentsAtNextStopList students={students} /> : null}

                <TodaysRouteList stops={data.route.stops} />
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e5e7eb',
    },
    scroll: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 14,
        paddingBottom: 24,
        gap: 12,
    },
    rowButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    halfButton: {
        flex: 1,
    },
});
