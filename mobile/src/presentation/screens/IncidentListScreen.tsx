import { useTheme } from '@/core/theme/ThemeContext';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Incident } from '@/domain/repositories/incident-repository';

interface IncidentListScreenProps {
    onBack: () => void;
    incidents: Incident[];
    loading: boolean;
    refreshing: boolean;
    onRefresh: () => void;
}

type FilterType = 'All' | 'Breakdown' | 'Accident' | 'Delay';
type FilterSeverity = 'All' | 'Low' | 'Medium' | 'High';

const TYPE_META: Record<string, { color: string; icon: string; bg: string }> = {
    Breakdown: { color: '#f59e0b', icon: 'build',    bg: '#f59e0b15' },
    Accident:  { color: '#ef4444', icon: 'warning',  bg: '#ef444415' },
    Delay:     { color: '#3b82f6', icon: 'time',     bg: '#3b82f615' },
};

const SEVERITY_META: Record<string, { color: string; bg: string }> = {
    Low:    { color: '#10b981', bg: '#10b98115' },
    Medium: { color: '#f59e0b', bg: '#f59e0b15' },
    High:   { color: '#ef4444', bg: '#ef444415' },
};

const TYPE_FILTERS: FilterType[]     = ['All', 'Breakdown', 'Accident', 'Delay'];
const SEVERITY_FILTERS: FilterSeverity[] = ['All', 'Low', 'Medium', 'High'];

function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now  = new Date();
    const diffMs   = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs  = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 60)  return `${diffMins}m ago`;
    if (diffHrs  < 24)  return `${diffHrs}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays  < 7)  return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullDate(dateString: string) {
    return new Date(dateString).toLocaleString('en-US', {
        weekday: 'short',
        month:   'short',
        day:     'numeric',
        year:    'numeric',
        hour:    '2-digit',
        minute:  '2-digit',
    });
}

export default function IncidentListScreen({
    onBack,
    incidents,
    loading,
    refreshing,
    onRefresh,
}: IncidentListScreenProps) {
    const { theme } = useTheme();
    const [typeFilter, setTypeFilter]         = useState<FilterType>('All');
    const [severityFilter, setSeverityFilter] = useState<FilterSeverity>('All');
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

    const filtered = incidents.filter((i) => {
        const matchType     = typeFilter     === 'All' || i.type     === typeFilter;
        const matchSeverity = severityFilter === 'All' || i.severity === severityFilter;
        return matchType && matchSeverity;
    });

    // Summary counts
    const totalToday = incidents.filter((i) => {
        const today = new Date().toISOString().split('T')[0];
        return i.createdAt.startsWith(today);
    }).length;

    const highCount = incidents.filter((i) => i.severity === 'High').length;

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>

                {/* ── Header ── */}
                <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton} accessibilityLabel="Go back">
                        <Ionicons name="arrow-back" size={22} color={theme.colors.foreground} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <ThemedText style={styles.headerTitle} type="subtitle">
                            My Incidents
                        </ThemedText>
                        <ThemedText style={styles.headerSubtitle} lightColor="#888" darkColor="#777">
                            {incidents.length} total report{incidents.length !== 1 ? 's' : ''}
                        </ThemedText>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                {/* ── Summary Banner ── */}
                {incidents.length > 0 && (
                    <View style={[styles.summaryBanner, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
                        <View style={[styles.summaryItem, { borderRightWidth: 1, borderRightColor: theme.colors.border }]}>
                            <ThemedText style={[styles.summaryValue, { color: theme.colors.primary }]}>
                                {incidents.length}
                            </ThemedText>
                            <ThemedText style={styles.summaryLabel} lightColor="#888" darkColor="#777">
                                Total
                            </ThemedText>
                        </View>
                        <View style={[styles.summaryItem, { borderRightWidth: 1, borderRightColor: theme.colors.border }]}>
                            <ThemedText style={[styles.summaryValue, { color: '#3b82f6' }]}>
                                {totalToday}
                            </ThemedText>
                            <ThemedText style={styles.summaryLabel} lightColor="#888" darkColor="#777">
                                Today
                            </ThemedText>
                        </View>
                        <View style={styles.summaryItem}>
                            <ThemedText style={[styles.summaryValue, { color: '#ef4444' }]}>
                                {highCount}
                            </ThemedText>
                            <ThemedText style={styles.summaryLabel} lightColor="#888" darkColor="#777">
                                High Severity
                            </ThemedText>
                        </View>
                    </View>
                )}

                {/* ── Filters ── */}
                <View style={[styles.filtersWrap, { borderBottomColor: theme.colors.border }]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                        {/* Type chips */}
                        {TYPE_FILTERS.map((f) => {
                            const isActive = typeFilter === f;
                            const meta = f !== 'All' ? TYPE_META[f] : null;
                            return (
                                <TouchableOpacity
                                    key={f}
                                    onPress={() => setTypeFilter(f)}
                                    style={[
                                        styles.filterChip,
                                        {
                                            backgroundColor: isActive ? (meta?.color ?? theme.colors.primary) + '18' : theme.colors.card,
                                            borderColor:     isActive ? (meta?.color ?? theme.colors.primary) : theme.colors.border,
                                            borderWidth: isActive ? 1.5 : 1,
                                        },
                                    ]}
                                >
                                    {meta && (
                                        <Ionicons name={meta.icon as any} size={13} color={isActive ? meta.color : theme.colors.foreground + '70'} style={{ marginRight: 4 }} />
                                    )}
                                    <ThemedText
                                        style={[styles.filterChipText, { color: isActive ? (meta?.color ?? theme.colors.primary) : theme.colors.foreground + '80' }]}
                                    >
                                        {f}
                                    </ThemedText>
                                </TouchableOpacity>
                            );
                        })}

                        <View style={styles.filterDivider} />

                        {/* Severity chips */}
                        {SEVERITY_FILTERS.map((f) => {
                            const isActive = severityFilter === f;
                            const meta = f !== 'All' ? SEVERITY_META[f] : null;
                            return (
                                <TouchableOpacity
                                    key={f}
                                    onPress={() => setSeverityFilter(f)}
                                    style={[
                                        styles.filterChip,
                                        {
                                            backgroundColor: isActive ? (meta?.color ?? theme.colors.primary) + '18' : theme.colors.card,
                                            borderColor:     isActive ? (meta?.color ?? theme.colors.primary) : theme.colors.border,
                                            borderWidth: isActive ? 1.5 : 1,
                                        },
                                    ]}
                                >
                                    {meta && (
                                        <View style={[styles.severityDotSmall, { backgroundColor: meta.color, opacity: isActive ? 1 : 0.4 }]} />
                                    )}
                                    <ThemedText
                                        style={[styles.filterChipText, { color: isActive ? (meta?.color ?? theme.colors.primary) : theme.colors.foreground + '80' }]}
                                    >
                                        {f}
                                    </ThemedText>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* ── Result count ── */}
                {(typeFilter !== 'All' || severityFilter !== 'All') && (
                    <View style={[styles.resultBar, { backgroundColor: theme.colors.muted + '50' }]}>
                        <ThemedText style={styles.resultText} lightColor="#888" darkColor="#777">
                            Showing {filtered.length} of {incidents.length} incidents
                        </ThemedText>
                        <TouchableOpacity
                            onPress={() => { setTypeFilter('All'); setSeverityFilter('All'); }}
                            style={[styles.clearFiltersBtn, { borderColor: theme.colors.border }]}
                        >
                            <Ionicons name="close" size={12} color={theme.colors.foreground + '80'} />
                            <ThemedText style={styles.clearFiltersText} lightColor="#888" darkColor="#777">
                                Clear
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                )}

                {/* ── List ── */}
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[
                        styles.listContent,
                        filtered.length === 0 && styles.listContentEmpty,
                    ]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.colors.primary}
                            colors={[theme.colors.primary]}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <View style={[styles.emptyIconCircle, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                <Ionicons
                                    name={incidents.length === 0 ? 'checkmark-circle-outline' : 'filter-outline'}
                                    size={44}
                                    color={theme.colors.border}
                                />
                            </View>
                            <ThemedText style={styles.emptyTitle} type="subtitle">
                                {incidents.length === 0 ? 'All Clear!' : 'No Matches'}
                            </ThemedText>
                            <ThemedText style={styles.emptySubtitle} lightColor="#888" darkColor="#666">
                                {incidents.length === 0
                                    ? "You haven't reported any incidents yet."
                                    : 'Try adjusting your filters above.'}
                            </ThemedText>
                        </View>
                    }
                    renderItem={({ item: incident, index }) => {
                        const typeMeta     = TYPE_META[incident.type]     ?? { color: theme.colors.primary, icon: 'alert-circle', bg: theme.colors.primary + '15' };
                        const severityMeta = SEVERITY_META[incident.severity] ?? { color: theme.colors.primary, bg: theme.colors.primary + '15' };
                        const hasCoords    = incident.latitude != null && incident.longitude != null;

                        return (
                            <TouchableOpacity
                                activeOpacity={0.75}
                                onPress={() => setSelectedIncident(incident)}
                                accessibilityLabel={`View incident: ${incident.type}`}
                            >
                                <ThemedCard style={styles.card} padding={0}>
                                    {/* Left accent bar */}
                                    <View style={[styles.accentBar, { backgroundColor: typeMeta.color }]} />

                                    <View style={styles.cardInner}>
                                        {/* Row 1 – badges & time */}
                                        <View style={styles.cardTop}>
                                            <View style={[styles.typeBadge, { backgroundColor: typeMeta.bg }]}>
                                                <Ionicons name={typeMeta.icon as any} size={13} color={typeMeta.color} style={{ marginRight: 5 }} />
                                                <ThemedText style={[styles.typeBadgeText, { color: typeMeta.color }]}>
                                                    {incident.type}
                                                </ThemedText>
                                            </View>

                                            <View style={styles.cardTopRight}>
                                                <View style={[styles.severityBadge, { backgroundColor: severityMeta.bg }]}>
                                                    <View style={[styles.severityDotSmall, { backgroundColor: severityMeta.color }]} />
                                                    <ThemedText style={[styles.severityBadgeText, { color: severityMeta.color }]}>
                                                        {incident.severity}
                                                    </ThemedText>
                                                </View>
                                                <ThemedText style={styles.timeText} lightColor="#aaa" darkColor="#666">
                                                    {formatDate(incident.createdAt)}
                                                </ThemedText>
                                            </View>
                                        </View>

                                        {/* Row 2 – description */}
                                        <ThemedText style={styles.descText} numberOfLines={2}>
                                            {incident.description}
                                        </ThemedText>

                                        {/* Row 3 – meta pills */}
                                        <View style={styles.cardMeta}>
                                            {hasCoords && (
                                                <View style={[styles.metaPill, { backgroundColor: '#10b98115' }]}>
                                                    <Ionicons name="location" size={11} color="#10b981" />
                                                    <ThemedText style={[styles.metaPillText, { color: '#10b981' }]}>
                                                        GPS attached
                                                    </ThemedText>
                                                </View>
                                            )}
                                            <View style={[styles.metaPill, { backgroundColor: theme.colors.primary + '10' }]}>
                                                <Ionicons name="eye-outline" size={11} color={theme.colors.primary} />
                                                <ThemedText style={[styles.metaPillText, { color: theme.colors.primary }]}>
                                                    Tap to view
                                                </ThemedText>
                                            </View>
                                        </View>
                                    </View>
                                </ThemedCard>
                            </TouchableOpacity>
                        );
                    }}
                />
            </SafeAreaView>

            {/* ── Detail Modal ── */}
            <Modal
                visible={selectedIncident != null}
                animationType="slide"
                transparent
                onRequestClose={() => setSelectedIncident(null)}
            >
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={() => setSelectedIncident(null)}
                />
                {selectedIncident && (() => {
                    const typeMeta     = TYPE_META[selectedIncident.type]     ?? { color: theme.colors.primary, icon: 'alert-circle', bg: theme.colors.primary + '15' };
                    const severityMeta = SEVERITY_META[selectedIncident.severity] ?? { color: theme.colors.primary, bg: theme.colors.primary + '15' };
                    const hasCoords    = selectedIncident.latitude != null && selectedIncident.longitude != null;

                    return (
                        <View style={[styles.modalSheet, { backgroundColor: theme.colors.background }]}>
                            {/* Handle */}
                            <View style={[styles.modalHandle, { backgroundColor: theme.colors.border }]} />

                            {/* Modal header */}
                            <View style={styles.modalHeader}>
                                <View style={[styles.modalTypeIcon, { backgroundColor: typeMeta.bg }]}>
                                    <Ionicons name={typeMeta.icon as any} size={22} color={typeMeta.color} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <ThemedText style={[styles.modalType, { color: typeMeta.color }]}>
                                        {selectedIncident.type}
                                    </ThemedText>
                                    <ThemedText style={styles.modalDate} lightColor="#888" darkColor="#777">
                                        {formatFullDate(selectedIncident.createdAt)}
                                    </ThemedText>
                                </View>
                                <TouchableOpacity onPress={() => setSelectedIncident(null)} style={styles.modalClose}>
                                    <Ionicons name="close" size={20} color={theme.colors.foreground + '80'} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
                                {/* Severity */}
                                <View style={[styles.modalSection, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                    <ThemedText style={styles.modalSectionLabel} lightColor="#888" darkColor="#777">Severity</ThemedText>
                                    <View style={[styles.severityBadge, { backgroundColor: severityMeta.bg, alignSelf: 'flex-start', marginTop: 6 }]}>
                                        <View style={[styles.severityDotSmall, { backgroundColor: severityMeta.color }]} />
                                        <ThemedText style={[styles.severityBadgeText, { color: severityMeta.color, fontSize: 14 }]}>
                                            {selectedIncident.severity}
                                        </ThemedText>
                                    </View>
                                </View>

                                {/* Description */}
                                <View style={[styles.modalSection, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                    <ThemedText style={styles.modalSectionLabel} lightColor="#888" darkColor="#777">Description</ThemedText>
                                    <ThemedText style={styles.modalDesc}>{selectedIncident.description}</ThemedText>
                                </View>

                                {/* Location */}
                                <View style={[styles.modalSection, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                    <ThemedText style={styles.modalSectionLabel} lightColor="#888" darkColor="#777">Location</ThemedText>
                                    {hasCoords ? (
                                        <View style={[styles.coordsRow, { backgroundColor: '#10b98110' }]}>
                                            <Ionicons name="location" size={16} color="#10b981" />
                                            <ThemedText style={[styles.coordsText, { color: '#10b981' }]}>
                                                {selectedIncident.latitude!.toFixed(5)}°N · {selectedIncident.longitude!.toFixed(5)}°E
                                            </ThemedText>
                                        </View>
                                    ) : (
                                        <ThemedText style={styles.modalDesc} lightColor="#aaa" darkColor="#666">
                                            No GPS coordinates recorded
                                        </ThemedText>
                                    )}
                                </View>

                                {/* Incident ID */}
                                <View style={[styles.modalSection, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                    <ThemedText style={styles.modalSectionLabel} lightColor="#888" darkColor="#777">Incident ID</ThemedText>
                                    <ThemedText style={[styles.incidentId, { color: theme.colors.foreground + '70' }]}>
                                        #{selectedIncident.id}
                                    </ThemedText>
                                </View>
                            </ScrollView>
                        </View>
                    );
                })()}
            </Modal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea:  { flex: 1 },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backButton: {
        width: 44, height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22,
    },
    headerCenter: { alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '700' },
    headerSubtitle: { fontSize: 12, marginTop: 1 },

    // Summary
    summaryBanner: {
        flexDirection: 'row',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
    },
    summaryValue: { fontSize: 22, fontWeight: '800' },
    summaryLabel: { fontSize: 11, marginTop: 2 },

    // Filters
    filtersWrap: { borderBottomWidth: StyleSheet.hairlineWidth },
    filtersScroll: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    filterChipText: { fontSize: 12, fontWeight: '600' },
    filterDivider: {
        width: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginHorizontal: 4,
        borderRadius: 1,
    },
    severityDotSmall: { width: 7, height: 7, borderRadius: 4, marginRight: 5 },

    // Result bar
    resultBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    resultText: { fontSize: 12 },
    clearFiltersBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 1,
    },
    clearFiltersText: { fontSize: 12 },

    // List
    listContent: { padding: 16, gap: 12 },
    listContentEmpty: { flexGrow: 1, justifyContent: 'center' },

    // Empty
    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyIconCircle: {
        width: 90, height: 90,
        borderRadius: 45,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: { marginBottom: 8 },
    emptySubtitle: { textAlign: 'center', fontSize: 14, lineHeight: 22 },

    // Card
    card: { borderRadius: 18, flexDirection: 'row', overflow: 'hidden', marginBottom: 0 },
    accentBar: { width: 4, borderRadius: 0 },
    cardInner: { flex: 1, padding: 14, gap: 8 },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardTopRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    typeBadgeText: { fontSize: 12, fontWeight: '700' },
    severityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    severityBadgeText: { fontSize: 11, fontWeight: '700' },
    timeText: { fontSize: 12 },
    descText: { fontSize: 14, lineHeight: 20 },
    cardMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    metaPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    metaPillText: { fontSize: 11, fontWeight: '600' },

    // Modal
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    modalSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingBottom: Platform.OS === 'ios' ? 36 : 24,
        maxHeight: '80%',
    },
    modalHandle: {
        width: 40, height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 14,
    },
    modalTypeIcon: {
        width: 50, height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalType: { fontSize: 18, fontWeight: '800' },
    modalDate: { fontSize: 12, marginTop: 2 },
    modalClose: {
        width: 36, height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBody: { paddingHorizontal: 20, gap: 12, paddingBottom: 8 },
    modalSection: {
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 16,
        padding: 16,
    },
    modalSectionLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    modalDesc: { fontSize: 15, lineHeight: 22, marginTop: 8 },
    coordsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        marginTop: 8,
    },
    coordsText: { fontSize: 13, fontWeight: '600', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    incidentId: { fontSize: 13, marginTop: 6, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
});
