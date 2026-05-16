import { ColorPalettes } from '@/core/theme/tokens';
import { RouteStop } from '@/domain/entities/driver-workflow';
import { ThemedText } from '@/presentation/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

type NextStopCardProps = {
    stop: RouteStop;
    etaMinutes: number;
};

export function NextStopCard({ stop, etaMinutes }: NextStopCardProps) {
    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <View style={styles.iconLabelRow}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="location-outline" size={18} color="#fff" />
                    </View>
                    <View>
                        <ThemedText lightColor="#bfdbfe" darkColor="#bfdbfe" style={styles.label}>
                            Next Stop
                        </ThemedText>
                        <ThemedText lightColor="#fff" darkColor="#fff" style={styles.name}>
                            {stop.stopName} Stop
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.etaWrap}>
                    <ThemedText lightColor="#fff" darkColor="#fff" style={styles.etaValue}>
                        {etaMinutes} min
                    </ThemedText>
                    <ThemedText lightColor="#bfdbfe" darkColor="#bfdbfe" style={styles.etaLabel}>
                        ETA
                    </ThemedText>
                </View>
            </View>

            <View style={styles.bottomRow}>
                <Ionicons name="people-outline" size={16} color="#dbeafe" />
                <ThemedText lightColor="#dbeafe" darkColor="#dbeafe" style={styles.pickupText}>
                    {stop.studentCount} students to pick up
                </ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: ColorPalettes.blue[600],
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 14,
        shadowColor: '#1d4ed8',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 4,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    iconLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    iconCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 14,
        lineHeight: 18,
    },
    name: {
        fontSize: 18,
        lineHeight: 22,
        fontWeight: '600',
    },
    etaWrap: {
        alignItems: 'flex-end',
    },
    etaValue: {
        fontSize: 22,
        lineHeight: 22,
        fontWeight: '700',
    },
    etaLabel: {
        fontSize: 12,
        lineHeight: 16,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    pickupText: {
        fontSize: 14,
        lineHeight: 18,
    },
});
