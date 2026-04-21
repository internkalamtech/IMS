import { ColorPalettes } from '@/core/theme/tokens';
import { RouteStop, StopStatus } from '@/domain/entities/driver-workflow';
import { ThemedText } from '@/presentation/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

type TodaysRouteListProps = {
    stops: RouteStop[];
};

type RouteStopItemProps = {
    stop: RouteStop;
    isLast: boolean;
};

function stopIcon(status: StopStatus) {
    if (status === StopStatus.Completed) {
        return {
            icon: 'checkmark',
            color: ColorPalettes.green[600],
            bg: ColorPalettes.green[600],
            line: ColorPalettes.green[600],
        };
    }

    if (status === StopStatus.Current) {
        return {
            icon: 'location-outline',
            color: ColorPalettes.blue[600],
            bg: ColorPalettes.blue[600],
            line: ColorPalettes.slate[300],
        };
    }

    return {
        icon: 'time-outline',
        color: ColorPalettes.slate[500],
        bg: ColorPalettes.slate[200],
        line: ColorPalettes.slate[300],
    };
}

function RouteStopItem({ stop, isLast }: RouteStopItemProps) {
    const iconConfig = stopIcon(stop.status);
    const textColor = stop.status === StopStatus.Current ? ColorPalettes.blue[600] : '#1f2937';

    return (
        <View style={styles.stopRow}>
            <View style={styles.iconColumn}>
                <View style={[styles.iconWrapper, { backgroundColor: iconConfig.bg }]}>
                    <Ionicons name={iconConfig.icon as any} size={18} color="#fff" />
                </View>
                {!isLast ? <View style={[styles.verticalLine, { backgroundColor: iconConfig.line }]} /> : null}
            </View>

            <View style={styles.stopDetails}>
                <ThemedText style={[styles.stopName, { color: textColor }]}>{stop.stopName}</ThemedText>
                <ThemedText style={styles.stopMeta} lightColor="#64748b" darkColor="#94a3b8">
                    {stop.studentCount > 0 ? `${stop.studentCount} students` : 'Destination'} • {stop.scheduledTime}
                </ThemedText>
            </View>

            {stop.status === StopStatus.Current ? (
                <View style={styles.currentTag}>
                    <ThemedText style={styles.currentText} lightColor={ColorPalettes.blue[600]} darkColor={ColorPalettes.blue[400]}>
                        Current
                    </ThemedText>
                </View>
            ) : null}
        </View>
    );
}

export function TodaysRouteList({ stops }: TodaysRouteListProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="location-outline" size={20} color="#111827" />
                <ThemedText style={styles.title}>Today&apos;s Route</ThemedText>
            </View>

            <View style={styles.card}>
                {stops.map((stop, index) => (
                    <RouteStopItem key={stop.stopId} stop={stop} isLast={index === stops.length - 1} />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 18,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
    },
    title: {
        fontSize: 20,
        lineHeight: 26,
        fontWeight: '500',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(15, 23, 42, 0.08)',
        paddingVertical: 14,
        paddingHorizontal: 12,
        shadowColor: '#0f172a',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
        elevation: 2,
    },
    stopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        minHeight: 72,
    },
    iconColumn: {
        width: 34,
        alignItems: 'center',
    },
    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verticalLine: {
        width: 2,
        height: 46,
        marginTop: 4,
    },
    stopDetails: {
        flex: 1,
        marginLeft: 10,
    },
    stopName: {
        fontSize: 18,
        lineHeight: 25,
        fontWeight: '500',
    },
    stopMeta: {
        fontSize: 14,
        lineHeight: 20,
    },
    currentTag: {
        alignSelf: 'center',
        backgroundColor: '#dbeafe',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    currentText: {
        fontSize: 13,
        lineHeight: 16,
    },
});
