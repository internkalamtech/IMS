import { ColorPalettes } from '@/core/theme/tokens';
import { DriverProfile, TripRoute, TripSession } from '@/domain/entities/driver-workflow';
import { ThemedText } from '@/presentation/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

type DriverStatusCardProps = {
    profile: DriverProfile;
    route: TripRoute;
    session: TripSession;
    active: boolean;
};

export function DriverStatusCard({ profile, route, session, active }: DriverStatusCardProps) {
    const currentCardColor = active ? ColorPalettes.green[600] : ColorPalettes.blue[600];
    const innerCardColor = active ? '#03b24f' : '#1976f3';

    return (
        <View style={[styles.container, { backgroundColor: currentCardColor }]}>
            <View style={styles.headerRow}>
                <View>
                    <ThemedText lightColor="#fff" darkColor="#fff" style={styles.nameText}>
                        {profile.name}
                    </ThemedText>
                    <ThemedText lightColor="#dbeafe" darkColor="#dbeafe" style={styles.designationText}>
                        Driver • {profile.busNumber}
                    </ThemedText>
                </View>
                {active ? (
                    <View style={styles.activeBadge}>
                        <View style={styles.dot} />
                        <ThemedText lightColor="#fff" darkColor="#fff" style={styles.badgeText}>
                            Trip Active
                        </ThemedText>
                    </View>
                ) : null}
            </View>

            <View style={[styles.routePanel, { backgroundColor: innerCardColor }]}>
                <View style={styles.routeHeader}>
                    <View>
                        <ThemedText lightColor="#dbeafe" darkColor="#dbeafe" style={styles.routeLabel}>
                            Current Route
                        </ThemedText>
                        <ThemedText lightColor="#fff" darkColor="#fff" style={styles.routeName}>
                            {route.routeName}
                        </ThemedText>
                    </View>
                    <Ionicons name="bus-outline" size={28} color="#cce4ff" />
                </View>

                <View style={styles.metricsRow}>
                    <View>
                        <ThemedText lightColor="#dbeafe" darkColor="#dbeafe" style={styles.metricLabel}>
                            Students
                        </ThemedText>
                        <ThemedText lightColor="#fff" darkColor="#fff" style={styles.metricValue}>
                            {session.studentsBoarded}/{session.totalStudents}
                        </ThemedText>
                    </View>
                    <View>
                        <ThemedText lightColor="#dbeafe" darkColor="#dbeafe" style={styles.metricLabel}>
                            Stops
                        </ThemedText>
                        <ThemedText lightColor="#fff" darkColor="#fff" style={styles.metricValue}>
                            {session.completedStops}/{session.totalStops}
                        </ThemedText>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        padding: 20,
        marginTop: 8,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    nameText: {
        fontSize: 17,
        fontWeight: '600',
        lineHeight: 22,
    },
    designationText: {
        fontSize: 14,
        lineHeight: 19,
    },
    activeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        paddingVertical: 6,
        paddingHorizontal: 10,
        gap: 6,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: ColorPalettes.red[500],
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '500',
    },
    routePanel: {
        borderRadius: 16,
        padding: 16,
    },
    routeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    routeLabel: {
        fontSize: 13,
        lineHeight: 18,
    },
    routeName: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '600',
    },
    metricsRow: {
        flexDirection: 'row',
        gap: 48,
    },
    metricLabel: {
        fontSize: 13,
    },
    metricValue: {
        fontSize: 22,
        fontWeight: '700',
        lineHeight: 28,
    },
});
