/**
 * AttendanceSummaryScreen — Issue #298
 * Multi-Child Attendance Summary.
 *
 * Shows a summary card per child with:
 *  • Attendance percentage badge
 *  • Progress bar
 *  • Present / Absent day counts
 *  • "View Calendar" button → navigates to AttendanceCalendarScreen
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { attendanceRepository } from '@/data/repositories/attendance-repository-impl';
import { ChildSummary } from '@/domain/repositories/attendance-repository';
import { useAuth } from '@/presentation/hooks/useAuth';

// ── Colour helpers ────────────────────────────────────────────────────────────
function getAttendanceColor(pct: number) {
    if (pct >= 90) return { text: '#16A34A', bg: '#F0FDF4', bar: '#22C55E' };
    if (pct >= 75) return { text: '#D97706', bg: '#FFFBEB', bar: '#F59E0B' };
    return { text: '#DC2626', bg: '#FEF2F2', bar: '#EF4444' };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AttendanceSummaryScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [children, setChildren] = useState<ChildSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        const data = await attendanceRepository.getParentChildren();
        setChildren(data);
    }, []);

    useEffect(() => {
        load().finally(() => setLoading(false));
    }, [load]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    }, [load]);

    const openCalendar = (child: ChildSummary) => {
        // Navigate to the calendar screen passing the child id & name
        router.push({
            pathname: '/attendance-calendar',
            params: { childId: child.id, childName: child.name },
        });
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.headerTitle}>My Children</Text>
                        <Text style={styles.headerSub}>
                            Welcome, {user?.name?.split(' ')[0] || 'Parent'} 👋
                        </Text>
                    </View>
                    <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                        <Ionicons name="log-out-outline" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Body ── */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0066FF" />
                }
            >
                {loading ? (
                    <ActivityIndicator size="large" color="#0066FF" style={{ marginTop: 60 }} />
                ) : (
                    children.map(child => {
                        const colors = getAttendanceColor(child.overallAttendance);
                        return (
                            <View key={child.id} style={styles.card}>
                                {/* ── Card Header ── */}
                                <View style={styles.cardHeader}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarEmoji}>{child.emoji}</Text>
                                    </View>
                                    <View style={styles.childInfo}>
                                        <Text style={styles.childName}>{child.name}</Text>
                                        <Text style={styles.childMeta}>{child.grade} • Roll No: {child.rollNo}</Text>
                                    </View>
                                    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                                        <Text style={[styles.badgeText, { color: colors.text }]}>
                                            {child.overallAttendance}%
                                        </Text>
                                    </View>
                                </View>

                                {/* ── Progress Bar ── */}
                                <View style={styles.progressBg}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            {
                                                width: `${Math.min(child.overallAttendance, 100)}%` as any,
                                                backgroundColor: colors.bar,
                                            },
                                        ]}
                                    />
                                </View>

                                {/* ── Stats Row ── */}
                                <View style={styles.statsRow}>
                                    <View style={styles.statItem}>
                                        <MaterialCommunityIcons name="calendar-check" size={18} color="#22C55E" />
                                        <Text style={styles.statLabel}>Present</Text>
                                        <Text style={[styles.statValue, { color: '#22C55E' }]}>
                                            {child.presentDays} days
                                        </Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.statItem}>
                                        <MaterialCommunityIcons name="calendar-remove" size={18} color="#EF4444" />
                                        <Text style={styles.statLabel}>Absent</Text>
                                        <Text style={[styles.statValue, { color: '#EF4444' }]}>
                                            {child.absentDays} days
                                        </Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.statItem}>
                                        <Feather name="activity" size={16} color={child.statusColor} />
                                        <Text style={styles.statLabel}>Status</Text>
                                        <Text style={[styles.statValue, { color: child.statusColor }]}>
                                            {child.status}
                                        </Text>
                                    </View>
                                </View>

                                {/* ── View Calendar Button ── */}
                                <TouchableOpacity style={styles.calBtn} onPress={() => openCalendar(child)}>
                                    <Text style={styles.calBtnText}>View Attendance Calendar</Text>
                                    <Ionicons name="chevron-forward" size={16} color="#0066FF" />
                                </TouchableOpacity>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        backgroundColor: '#0066FF',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 16 : 8,
        paddingBottom: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
    headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
    logoutBtn: { padding: 8 },
    scroll: { flex: 1 },
    scrollContent: { padding: 16, paddingTop: 20 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    avatar: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
    },
    avatarEmoji: { fontSize: 26 },
    childInfo: { flex: 1 },
    childName: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
    childMeta: { fontSize: 13, color: '#64748B', marginTop: 2 },
    badge: {
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    },
    badgeText: { fontSize: 14, fontWeight: '700' },
    progressBg: {
        height: 8, backgroundColor: '#F1F5F9', borderRadius: 4,
        overflow: 'hidden', marginBottom: 14,
    },
    progressFill: { height: '100%', borderRadius: 4 },
    statsRow: {
        flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
        borderTopWidth: 1, borderTopColor: '#F1F5F9',
        paddingTop: 14, marginBottom: 12,
    },
    statItem: { alignItems: 'center', flex: 1 },
    statLabel: { fontSize: 11, color: '#64748B', marginTop: 4, marginBottom: 2 },
    statValue: { fontSize: 13, fontWeight: '700' },
    divider: { width: 1, height: 36, backgroundColor: '#F1F5F9' },
    calBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12,
    },
    calBtnText: { color: '#0066FF', fontWeight: '600', fontSize: 14, marginRight: 4 },
});
