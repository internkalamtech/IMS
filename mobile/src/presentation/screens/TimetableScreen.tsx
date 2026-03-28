import { useTheme } from '@/core/theme/ThemeContext';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ViewMode = 'Daily' | 'Weekly';

type Period = {
    id: string;
    subject: string;
    teacher?: string;
    room?: string;
    startTime: string;
    endTime: string;
    isBreak?: boolean;
};

const TIMETABLE: Period[] = [
    { id: '1', subject: 'Mathematics', teacher: 'Ms. Anderson', room: 'Room 201', startTime: '08:00', endTime: '08:45' },
    { id: '2', subject: 'English', teacher: 'Mr. Thompson', room: 'Room 105', startTime: '08:50', endTime: '09:35' },
    { id: '3', subject: 'Science', teacher: 'Dr. Williams', room: 'Lab 1', startTime: '09:40', endTime: '10:25' },
    { id: '4', subject: 'BREAK', startTime: '10:30', endTime: '10:45', isBreak: true },
    { id: '5', subject: 'Social Studies', teacher: 'Ms. Davis', room: 'Room 302', startTime: '10:45', endTime: '11:30' },
    { id: '6', subject: 'Computer Science', teacher: 'Mr. Lee', room: 'Lab 2', startTime: '11:35', endTime: '12:20' },
    { id: '7', subject: 'LUNCH BREAK', startTime: '12:20', endTime: '13:05', isBreak: true },
    { id: '8', subject: 'Physical Education', teacher: 'Mr. Singh', room: 'Ground', startTime: '13:05', endTime: '13:50' },
    { id: '9', subject: 'Hindi', teacher: 'Mrs. Patel', room: 'Room 110', startTime: '13:55', endTime: '14:40' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetableScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const [viewMode, setViewMode] = useState<ViewMode>('Daily');
    const [dayIndex, setDayIndex] = useState(0);

    const today = new Date();
    // Compute the date for the selected day (Mon of current week + dayIndex)
    const getDateForDay = (index: number) => {
        const d = new Date(today);
        const dow = d.getDay(); // 0=Sun
        const monOffset = dow === 0 ? -6 : 1 - dow;
        d.setDate(d.getDate() + monOffset + index);
        return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

            {/* Blue Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <Ionicons name="chevron-back" size={24} color={theme.colors.primaryForeground} />
                        </TouchableOpacity>
                        <View style={styles.headerTitle}>
                            <ThemedText style={styles.titleText} color="primaryForeground">Timetable</ThemedText>
                            <ThemedText style={styles.subtitleText} color="primaryForeground">Aarav Kumar</ThemedText>
                        </View>
                        <View style={styles.calIcon}>
                            <Ionicons name="calendar-outline" size={22} color={theme.colors.primaryForeground} />
                        </View>
                    </View>

                    {/* Daily / Weekly toggle */}
                    <View style={[styles.toggleRow, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        {(['Daily', 'Weekly'] as ViewMode[]).map(mode => (
                            <TouchableOpacity
                                key={mode}
                                onPress={() => setViewMode(mode)}
                                style={[
                                    styles.toggleBtn,
                                    viewMode === mode && { backgroundColor: '#fff' },
                                ]}
                            >
                                <ThemedText
                                    style={[
                                        styles.toggleText,
                                        viewMode === mode
                                            ? { color: theme.colors.primary }
                                            : { color: theme.colors.primaryForeground },
                                    ]}
                                >
                                    {mode}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {viewMode === 'Daily' ? (
                    <>
                        {/* Day navigator */}
                        <View style={styles.dayNav}>
                            <TouchableOpacity
                                onPress={() => setDayIndex(i => Math.max(0, i - 1))}
                                disabled={dayIndex === 0}
                            >
                                <Ionicons
                                    name="chevron-back"
                                    size={24}
                                    color={dayIndex === 0 ? theme.colors.border : theme.colors.foreground}
                                />
                            </TouchableOpacity>
                            <ThemedText style={styles.dayText} type="defaultSemiBold">
                                {getDateForDay(dayIndex)}
                            </ThemedText>
                            <TouchableOpacity
                                onPress={() => setDayIndex(i => Math.min(5, i + 1))}
                                disabled={dayIndex === 5}
                            >
                                <Ionicons
                                    name="chevron-forward"
                                    size={24}
                                    color={dayIndex === 5 ? theme.colors.border : theme.colors.foreground}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Periods list */}
                        <View style={styles.periodsList}>
                            {TIMETABLE.map(period => (
                                period.isBreak ? (
                                    <View key={period.id} style={[styles.breakCard, { backgroundColor: theme.colors.border + '40' }]}>
                                        <ThemedText style={styles.breakText} lightColor="#888" darkColor="#888">
                                            {period.subject}
                                        </ThemedText>
                                        <ThemedText style={styles.breakTime} lightColor="#aaa" darkColor="#666">
                                            {period.startTime} - {period.endTime}
                                        </ThemedText>
                                    </View>
                                ) : (
                                    <ThemedCard key={period.id} style={[styles.periodCard, { borderLeftColor: theme.colors.primary, borderLeftWidth: 4 }]} padding={16}>
                                        <View style={styles.periodRow}>
                                            <View style={styles.periodInfo}>
                                                <ThemedText style={[styles.subjectName, { color: theme.colors.primary }]} type="defaultSemiBold">
                                                    {period.subject}
                                                </ThemedText>
                                                {period.teacher && (
                                                    <ThemedText style={styles.teacherName} lightColor="#555" darkColor="#aaa">
                                                        {period.teacher}
                                                    </ThemedText>
                                                )}
                                                {period.room && (
                                                    <ThemedText style={styles.roomName} lightColor="#888" darkColor="#777">
                                                        {period.room}
                                                    </ThemedText>
                                                )}
                                            </View>
                                            <ThemedText style={styles.timeText} lightColor="#666" darkColor="#999">
                                                {period.startTime} - {period.endTime}
                                            </ThemedText>
                                        </View>
                                    </ThemedCard>
                                )
                            ))}
                        </View>
                    </>
                ) : (
                    // Weekly view - day pills + condensed periods
                    <>
                        <View style={styles.weekDays}>
                            {DAYS.map((d, i) => (
                                <TouchableOpacity
                                    key={d}
                                    onPress={() => setDayIndex(i)}
                                    style={[
                                        styles.dayPill,
                                        dayIndex === i && { backgroundColor: theme.colors.primary },
                                    ]}
                                >
                                    <ThemedText
                                        style={[
                                            styles.dayPillText,
                                            dayIndex === i ? { color: '#fff' } : {},
                                        ]}
                                    >
                                        {d}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <ThemedText style={styles.weekDayTitle} type="defaultSemiBold">
                            {FULL_DAYS[dayIndex]}
                        </ThemedText>
                        <View style={styles.periodsList}>
                            {TIMETABLE.filter(p => !p.isBreak).map(period => (
                                <ThemedCard key={period.id} style={[styles.compactCard, { borderLeftColor: theme.colors.primary, borderLeftWidth: 3 }]} padding={12}>
                                    <View style={styles.compactRow}>
                                        <ThemedText style={[styles.compactSubject, { color: theme.colors.primary }]} type="defaultSemiBold">
                                            {period.subject}
                                        </ThemedText>
                                        <ThemedText style={styles.compactTime} lightColor="#888" darkColor="#777">
                                            {period.startTime}
                                        </ThemedText>
                                    </View>
                                    {period.teacher && (
                                        <ThemedText style={styles.compactTeacher} lightColor="#666" darkColor="#aaa">
                                            {period.teacher} · {period.room}
                                        </ThemedText>
                                    )}
                                </ThemedCard>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Header
    header: { paddingBottom: 20 },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    backBtn: { padding: 4, marginRight: 8 },
    headerTitle: { flex: 1 },
    titleText: { fontSize: 20, fontWeight: '700' },
    subtitleText: { fontSize: 13, opacity: 0.85, marginTop: 2 },
    calIcon: { padding: 4 },

    // Toggle
    toggleRow: {
        flexDirection: 'row',
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 4,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: 'center',
    },
    toggleText: { fontSize: 14, fontWeight: '600' },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 32 },

    // Day nav
    dayNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    dayText: { fontSize: 15 },

    // Periods
    periodsList: { gap: 10 },
    periodCard: {
        borderRadius: 14,
        marginBottom: 2,
    },
    periodRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    periodInfo: { flex: 1 },
    subjectName: { fontSize: 15, marginBottom: 4 },
    teacherName: { fontSize: 13, marginBottom: 2 },
    roomName: { fontSize: 12 },
    timeText: { fontSize: 13, marginLeft: 12 },

    // Break
    breakCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    breakText: { fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
    breakTime: { fontSize: 12 },

    // Weekly
    weekDays: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    dayPill: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f5',
    },
    dayPillText: { fontSize: 13, fontWeight: '600' },
    weekDayTitle: {
        fontSize: 16,
        marginBottom: 14,
        paddingHorizontal: 4,
    },
    compactCard: { borderRadius: 12, marginBottom: 2 },
    compactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    compactSubject: { fontSize: 14 },
    compactTime: { fontSize: 12 },
    compactTeacher: { fontSize: 12, marginTop: 4 },
});
