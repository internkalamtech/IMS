import { useTheme } from '@/core/theme/ThemeContext';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Incident } from '@/domain/repositories/incident-repository';

interface IncidentListScreenProps {
    onBack: () => void;
    incidents: Incident[];
    loading: boolean;
    refreshing: boolean;
    onRefresh: () => void;
}

export default function IncidentListScreen({ onBack, incidents, loading, refreshing, onRefresh }: IncidentListScreenProps) {
    const { theme } = useTheme();

    const getIncidentColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'breakdown': return '#f59e0b';
            case 'accident': return '#ef4444';
            case 'delay': return '#3b82f6';
            default: return theme.colors.primary;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.foreground} />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle} type="subtitle">My Incidents</ThemedText>
                    <View style={{ width: 40 }} /> {/* Placeholder for balance */}
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                >
                    {incidents.length === 0 && !loading ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="checkmark-circle-outline" size={64} color={theme.colors.border} />
                            <ThemedText style={styles.emptyStateTitle} type="subtitle">All Clear!</ThemedText>
                            <ThemedText style={styles.emptyStateText} lightColor="#666" darkColor="#999">
                                You haven&apos;t reported any incidents.
                            </ThemedText>
                        </View>
                    ) : (
                        incidents.map((incident) => (
                            <ThemedCard key={incident.id} style={styles.incidentCard} padding={16}>
                                <View style={styles.cardHeader}>
                                    <View style={[styles.typeBadge, { backgroundColor: getIncidentColor(incident.type) + '15' }]}>
                                        <Ionicons
                                            name={incident.type === 'Breakdown' ? 'build' : incident.type === 'Accident' ? 'warning' : 'time'}
                                            size={16}
                                            color={getIncidentColor(incident.type)}
                                            style={{ marginRight: 6 }}
                                        />
                                        <ThemedText style={[styles.typeText, { color: getIncidentColor(incident.type) }]}>
                                            {incident.type}
                                        </ThemedText>
                                    </View>

                                    <View style={[styles.severityBadge, { backgroundColor: incident.severity === 'High' ? '#ef444420' : incident.severity === 'Medium' ? '#f59e0b20' : '#10b98120' }]}>
                                        <ThemedText style={{ fontSize: 10, color: incident.severity === 'High' ? '#ef4444' : incident.severity === 'Medium' ? '#f59e0b' : '#10b981', fontWeight: 'bold' }}>{incident.severity}</ThemedText>
                                    </View>
                                </View>

                                <ThemedText style={styles.descriptionText} numberOfLines={3}>
                                    {incident.description}
                                </ThemedText>

                                <View style={styles.cardFooter}>
                                    <Ionicons name="time-outline" size={14} color="#888" style={{ marginRight: 4 }} />
                                    <ThemedText style={styles.timeText} lightColor="#888" darkColor="#888">
                                        {formatDate(incident.createdAt)}
                                    </ThemedText>
                                </View>
                            </ThemedCard>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    backButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 18,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyStateTitle: {
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        textAlign: 'center',
    },
    incidentCard: {
        marginBottom: 16,
        borderRadius: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    typeText: {
        fontSize: 13,
        fontWeight: '700',
    },
    severityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 12,
    },
    timeText: {
        fontSize: 12,
    },
});
