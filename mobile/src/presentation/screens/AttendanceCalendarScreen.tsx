/**
 * AttendanceCalendarScreen — Issue #299
 * Interactive Attendance Calendar — matches the prototype design.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { attendanceRepository } from '@/data/repositories/attendance-repository-impl';
import { AuthError } from '@/core/error';
import { useAuth } from '@/presentation/hooks/useAuth';
import { AttendanceCalendarData } from '@/domain/repositories/attendance-repository';

// ── Status → light card colour (matching prototype) ───────────────────────────
const STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
    'present':    { bg: '#DCFCE7', text: '#16A34A', border: '#86EFAC' },
    'absent':     { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5' },
    'leave':      { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
    'holiday':    { bg: '#EDE9FE', text: '#7C3AED', border: '#C4B5FD' },
    'not-marked': { bg: '#F8FAFC', text: '#CBD5E1', border: '#E2E8F0' },
};

const MONTH_NAMES = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
];
const WEEKDAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function monthKey(year: number, month: number) {
    return `${year}-${String(month).padStart(2, '0')}`;
}

export default function AttendanceCalendarScreen() {
    const router = useRouter();
    const { logout } = useAuth();
    const { childId, childName } = useLocalSearchParams<{ childId: string; childName: string }>();

    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [data, setData] = useState<AttendanceCalendarData | null>(null);
    const [loading, setLoading] = useState(true);

    // Leave application modal state
    const [leaveModal, setLeaveModal] = useState(false);
    const [leaveReason, setLeaveReason] = useState('');
    const [leaveFrom, setLeaveFrom] = useState('');
    const [leaveTo, setLeaveTo] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Track timeout to allow cleanup on unmount
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const load = useCallback(async (y: number, m: number) => {
        if (!childId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const result = await attendanceRepository.getChildCalendar(childId, monthKey(y, m));
        setData(result);
        setLoading(false);
    }, [childId]);

    useEffect(() => {
        if (!childId) {
            setLoading(false);
            router.back();
            return;
        }

        load(year, month);

        // Cleanup: clear any pending timeouts on unmount
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [year, month, load, childId, router]);

    const prevMonth = () => {
        if (month === 1) { setYear(y => y - 1); setMonth(12); }
        else setMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (month === 12) { setYear(y => y + 1); setMonth(1); }
        else setMonth(m => m + 1);
    };

    const buildGrid = (days: AttendanceCalendarData['days']) => {
        const firstWeekday = new Date(year, month - 1, 1).getDay();
        const blanks: null[] = Array(firstWeekday).fill(null);
        return [...blanks, ...days];
    };

    const [leaveError, setLeaveError] = useState<string | null>(null);

    const handleApplyLeave = async () => {
        if (!leaveFrom || !leaveTo || !leaveReason.trim()) {
            setLeaveError('Please fill in all fields.');
            return;
        }
        // Validate date format YYYY-MM-DD
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(leaveFrom) || !dateRegex.test(leaveTo)) {
            setLeaveError('Dates must be in YYYY-MM-DD format (e.g. 2026-03-28).');
            return;
        }
        if (leaveTo < leaveFrom) {
            setLeaveError('End date must be on or after the start date.');
            return;
        }
        setLeaveError(null);
        setSubmitting(true);
        try {
            const newEntry = await attendanceRepository.applyLeave({
                childId: childId ?? '1',
                startDate: leaveFrom,
                endDate: leaveTo,
                reason: leaveReason.trim(),
            });
            // Optimistically prepend the new entry to the list
            setData(prev =>
                prev
                    ? { ...prev, leaveHistory: [newEntry, ...prev.leaveHistory] }
                    : prev
            );
            setSubmitted(true);
            // Close modal and reset form after showing success tick
            timeoutRef.current = setTimeout(() => {
                setLeaveModal(false);
                setSubmitted(false);
                setLeaveReason('');
                setLeaveFrom('');
                setLeaveTo('');
            }, 1500);
        } catch (err: any) {
            // Session expired → close modal and log the user out
            if (err?.name === 'AuthError' || err instanceof AuthError) {
                setLeaveModal(false);
                logout();
                return;
            }
            const msg: string = err?.message ?? '';
            // Translate common network errors into user-friendly messages
            if (msg.includes('Network') || msg.includes('connect') || msg.includes('ECONNREFUSED')) {
                setLeaveError('Cannot connect to server. Make sure the backend is running.');
            } else if (msg.includes('500')) {
                setLeaveError('Server error. Please try again later.');
            } else {
                setLeaveError(msg || 'Failed to submit. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };


    const summary = data?.monthSummary;
    const grid = data ? buildGrid(data.days) : [];
    const notMarked = summary?.notMarked ?? 0;

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Attendance</Text>
                    <Text style={styles.headerSub}>{childName ?? 'Child'}</Text>
                </View>
                <Ionicons name="calendar-outline" size={22} color="#fff" />
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {loading ? (
                    <ActivityIndicator size="large" color="#0066FF" style={{ marginTop: 40 }} />
                ) : (
                    <>
                        {/* ── This Month Summary Card ── */}
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>This Month Summary</Text>
                            <View style={styles.summaryRow}>
                                {[
                                    { label: 'Present', value: summary?.present ?? 0, color: '#16A34A' },
                                    { label: 'Absent',  value: summary?.absent  ?? 0, color: '#DC2626' },
                                    { label: 'Leave',   value: summary?.leave   ?? 0, color: '#D97706' },
                                    { label: 'Holiday', value: summary?.holiday ?? 0, color: '#7C3AED' },
                                ].map(({ label, value, color }) => (
                                    <View key={label} style={styles.statBox}>
                                        <Text style={[styles.statNum, { color }]}>{value}</Text>
                                        <Text style={styles.statLabel}>{label}</Text>
                                    </View>
                                ))}
                            </View>
                            {notMarked > 0 && (
                                <View style={styles.notMarkedBanner}>
                                    <Text style={styles.notMarkedText}>{notMarked} days not marked yet</Text>
                                </View>
                            )}
                        </View>

                        {/* ── Calendar Card ── */}
                        <View style={styles.calendarCard}>
                            {/* Month Selector */}
                            <View style={styles.monthSelector}>
                                <TouchableOpacity onPress={prevMonth} style={styles.chevronBtn}>
                                    <Ionicons name="chevron-back" size={22} color="#374151" />
                                </TouchableOpacity>
                                <Text style={styles.monthLabel}>
                                    {MONTH_NAMES[month - 1]} {year}
                                </Text>
                                <TouchableOpacity onPress={nextMonth} style={styles.chevronBtn}>
                                    <Ionicons name="chevron-forward" size={22} color="#374151" />
                                </TouchableOpacity>
                            </View>

                            {/* Weekday Headers */}
                            <View style={styles.weekRow}>
                                {WEEKDAY_LABELS.map(d => (
                                    <Text key={d} style={styles.weekLabel}>{d}</Text>
                                ))}
                            </View>

                            {/* Grid */}
                            <View style={styles.grid}>
                                {grid.map((cell, idx) => {
                                    if (!cell) return <View key={`b-${idx}`} style={styles.cell} />;
                                    const s = STATUS_STYLE[cell.status] ?? STATUS_STYLE['not-marked'];
                                    const isToday =
                                        cell.day === today.getDate() &&
                                        month === today.getMonth() + 1 &&
                                        year === today.getFullYear();
                                    return (
                                        <View
                                            key={cell.day}
                                            style={[
                                                styles.cell,
                                                { backgroundColor: s.bg, borderColor: s.border, borderWidth: 1 },
                                                isToday && styles.todayCell,
                                            ]}
                                        >
                                            <Text style={[styles.cellText, { color: s.text }]}>
                                                {cell.day}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>

                            {/* Legend */}
                            <View style={styles.legend}>
                                {[
                                    { label: 'Present', color: '#16A34A', bg: '#DCFCE7' },
                                    { label: 'Absent',  color: '#DC2626', bg: '#FEE2E2' },
                                    { label: 'Leave',   color: '#D97706', bg: '#FEF3C7' },
                                    { label: 'Holiday', color: '#7C3AED', bg: '#EDE9FE' },
                                    { label: 'Not Marked', color: '#CBD5E1', bg: '#F8FAFC' },
                                ].map(({ label, color, bg }) => (
                                    <View key={label} style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: bg, borderColor: color, borderWidth: 1 }]} />
                                        <Text style={styles.legendText}>{label}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* ── Apply for Leave Button ── */}
                        <TouchableOpacity style={styles.applyBtn} onPress={() => setLeaveModal(true)}>
                            <Ionicons name="document-text-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.applyBtnText}>Apply for Leave</Text>
                        </TouchableOpacity>

                        {/* ── Leave History ── */}
                        {data?.leaveHistory && data.leaveHistory.length > 0 && (
                            <View style={styles.leaveSection}>
                                <Text style={styles.sectionTitle}>Leave History</Text>
                                {data.leaveHistory.map(lr => {
                                    const statusColor =
                                        lr.status === 'Approved' ? '#16A34A' :
                                        lr.status === 'Rejected' ? '#DC2626' : '#D97706';
                                    const statusBg =
                                        lr.status === 'Approved' ? '#F0FDF4' :
                                        lr.status === 'Rejected' ? '#FEF2F2' : '#FFFBEB';

                                    return (
                                        <View key={lr.id} style={styles.leaveCard}>
                                            <View style={styles.leaveCardHeader}>
                                                <Text style={styles.leaveDateRange}>{lr.dateRange}</Text>
                                                <View style={[styles.leaveBadge, { backgroundColor: statusBg }]}>
                                                    <Text style={[styles.leaveBadgeText, { color: statusColor }]}>
                                                        {lr.status}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={styles.leaveDuration}>
                                                {lr.days} day{lr.days !== 1 ? 's' : ''} • Applied: {lr.appliedDate}
                                            </Text>
                                            <Text style={styles.leaveReason}>{lr.reason}</Text>
                                            {lr.reviewedBy && (
                                                <Text style={styles.teacherNote}>
                                                    👩‍🏫 Reviewed by: {lr.reviewedBy}
                                                </Text>
                                            )}
                                            {lr.teacherNote && (
                                                <Text style={styles.teacherNote}>💬 {lr.teacherNote}</Text>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            {/* ── Apply Leave Modal ── */}
            <Modal visible={leaveModal} transparent animationType="slide" onRequestClose={() => setLeaveModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Apply for Leave</Text>
                            <TouchableOpacity onPress={() => setLeaveModal(false)}>
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        {submitted ? (
                            <View style={styles.successBox}>
                                <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
                                <Text style={styles.successText}>Leave Applied!</Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.modalLabel}>From Date</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="YYYY-MM-DD"
                                    value={leaveFrom}
                                    onChangeText={setLeaveFrom}
                                    placeholderTextColor="#94A3B8"
                                />
                                <Text style={styles.modalLabel}>To Date</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="YYYY-MM-DD"
                                    value={leaveTo}
                                    onChangeText={setLeaveTo}
                                    placeholderTextColor="#94A3B8"
                                />
                                <Text style={styles.modalLabel}>Reason</Text>
                                <TextInput
                                    style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                                    placeholder="Reason for leave..."
                                    value={leaveReason}
                                    onChangeText={setLeaveReason}
                                    multiline
                                    placeholderTextColor="#94A3B8"
                                />
                                <TouchableOpacity
                                    style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                                    onPress={handleApplyLeave}
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? <ActivityIndicator color="#fff" />
                                        : <Text style={styles.submitBtnText}>Submit Application</Text>
                                    }
                                </TouchableOpacity>
                                {leaveError && (
                                    <Text style={{ color: '#DC2626', fontSize: 13, marginTop: 10, textAlign: 'center' }}>
                                        {leaveError}
                                    </Text>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const CELL_SIZE = 40;

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F0F4F8' },
    header: {
        backgroundColor: '#0066FF',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 16 : 8,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backBtn: { padding: 6 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
    headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
    scroll: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 40 },

    // Summary card
    summaryCard: {
        backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    summaryTitle: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 14 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
    statBox: { alignItems: 'center' },
    statNum: { fontSize: 24, fontWeight: '800' },
    statLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    notMarkedBanner: {
        marginTop: 10, backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10,
        borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center',
    },
    notMarkedText: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },

    // Calendar card
    calendarCard: {
        backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    monthSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    chevronBtn: { padding: 6 },
    monthLabel: { fontSize: 17, fontWeight: '700', color: '#111827' },
    weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
    weekLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', width: CELL_SIZE, textAlign: 'center' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-start', marginBottom: 14 },
    cell: {
        width: CELL_SIZE, height: CELL_SIZE, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'transparent',
    },
    todayCell: { borderWidth: 2, borderColor: '#0066FF' },
    cellText: { fontSize: 13, fontWeight: '600' },

    // Legend
    legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    legendDot: { width: 12, height: 12, borderRadius: 6 },
    legendText: { fontSize: 11, color: '#6B7280' },

    // Apply leave button
    applyBtn: {
        backgroundColor: '#0066FF', borderRadius: 16, padding: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#0066FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    applyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    // Leave history
    leaveSection: { marginBottom: 16 },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 10 },
    leaveCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    },
    leaveCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    leaveDateRange: { fontSize: 14, fontWeight: '700', color: '#111827' },
    leaveBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
    leaveBadgeText: { fontSize: 12, fontWeight: '700' },
    leaveDuration: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
    leaveReason: { fontSize: 13, color: '#374151' },
    teacherNote: { marginTop: 6, fontSize: 12, color: '#6B7280', fontStyle: 'italic' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalBox: {
        backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, paddingBottom: 40,
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    modalLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
    modalInput: {
        borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12,
        padding: 12, fontSize: 14, color: '#111827', backgroundColor: '#F8FAFC',
    },
    submitBtn: {
        backgroundColor: '#0066FF', borderRadius: 14, padding: 16,
        alignItems: 'center', marginTop: 20,
    },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    successBox: { alignItems: 'center', padding: 24 },
    successText: { fontSize: 18, fontWeight: '700', color: '#16A34A', marginTop: 12 },
});
