import { DriverDashboardData } from '@/domain/usecases/get-driver-dashboard-usecase';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { DriverStatusCard } from '@/presentation/widgets/driver/DriverStatusCard';
import { TodaysRouteList } from '@/presentation/widgets/driver/TodaysRouteList';
import { TripActionButton } from '@/presentation/widgets/driver/TripActionButton';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

type DriverDashboardPageProps = {
    data: DriverDashboardData | null;
    loading: boolean;
    refreshing: boolean;
    startingTrip: boolean;
    errorMessage?: string;
    onRefresh: () => Promise<void>;
    onStartTrip: () => Promise<void>;
};

export function DriverDashboardPage({
    data,
    loading,
    refreshing,
    startingTrip,
    errorMessage,
    onRefresh,
    onStartTrip,
}: DriverDashboardPageProps) {
    if (loading) {
        return (
            <ThemedView style={styles.loaderWrap}>
                <ActivityIndicator size="large" color="#2563eb" />
            </ThemedView>
        );
    }

    if (!data) {
        return (
            <ThemedView style={styles.loaderWrap}>
                <ThemedText>{errorMessage ?? 'Unable to load driver dashboard.'}</ThemedText>
            </ThemedView>
        );
    }

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
                    active={false}
                />

                <View style={styles.primaryActionWrap}>
                    <TripActionButton
                        title={startingTrip ? 'Starting...' : 'Start Trip'}
                        iconName="play-circle-outline"
                        onPress={() => void onStartTrip()}
                        disabled={startingTrip}
                    />
                </View>

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
    },
    primaryActionWrap: {
        marginTop: 14,
    },
    loaderWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
