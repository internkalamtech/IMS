import { useTheme } from '@/core/theme/ThemeContext';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type Child = {
    id: number;
    name: string;
    class: string;
    avatar: string;
};

type Period = {
    id: number;
    subject: string;
    teacher: string;
    room: string;
    startTime: string;
    endTime: string;
    period: number;
    isBreak?: boolean;
};

// Mock data for demonstration
const MOCK_CHILDREN = [
    { id: 1, name: 'Aarav Kumar', class: 'Class 7-B', avatar: 'AK' },
    { id: 2, name: 'Priya Kumar', class: 'Class 5-A', avatar: 'PK' },
];

const MOCK_TIMETABLE = {
    0: [ // Monday
        { id: 1, subject: 'Mathematics', teacher: 'Mr. Sharma', room: 'Room 101', startTime: '09:00', endTime: '10:00', period: 1 },
        { id: 2, subject: 'English', teacher: 'Ms. Patel', room: 'Room 102', startTime: '10:00', endTime: '11:00', period: 2 },
        { id: 3, subject: 'Science', teacher: 'Mr. Kumar', room: 'Lab 201', startTime: '11:00', endTime: '12:00', period: 3 },
        { id: 4, subject: 'BREAK', teacher: '', room: '', startTime: '12:00', endTime: '12:30', period: 4, isBreak: true },
        { id: 5, subject: 'Social Studies', teacher: 'Ms. Singh', room: 'Room 103', startTime: '12:30', endTime: '13:30', period: 5 },
        { id: 6, subject: 'Hindi', teacher: 'Mr. Gupta', room: 'Room 104', startTime: '13:30', endTime: '14:30', period: 6 },
        { id: 7, subject: 'Computer Science', teacher: 'Ms. Reddy', room: 'Lab 202', startTime: '14:30', endTime: '15:30', period: 7 },
    ],
    1: [ // Tuesday
        { id: 8, subject: 'English', teacher: 'Ms. Patel', room: 'Room 102', startTime: '09:00', endTime: '10:00', period: 1 },
        { id: 9, subject: 'Mathematics', teacher: 'Mr. Sharma', room: 'Room 101', startTime: '10:00', endTime: '11:00', period: 2 },
        { id: 10, subject: 'Hindi', teacher: 'Mr. Gupta', room: 'Room 104', startTime: '11:00', endTime: '12:00', period: 3 },
        { id: 11, subject: 'BREAK', teacher: '', room: '', startTime: '12:00', endTime: '12:30', period: 4, isBreak: true },
        { id: 12, subject: 'Science', teacher: 'Mr. Kumar', room: 'Lab 201', startTime: '12:30', endTime: '13:30', period: 5 },
        { id: 13, subject: 'Social Studies', teacher: 'Ms. Singh', room: 'Room 103', startTime: '13:30', endTime: '14:30', period: 6 },
        { id: 14, subject: 'Physical Education', teacher: 'Mr. Joshi', room: 'Gym', startTime: '14:30', endTime: '15:30', period: 7 },
    ],
    // Add more days as needed
};

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetableScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const [selectedChild, setSelectedChild] = useState<Child>(MOCK_CHILDREN[0]);
    const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
    const [selectedDay, setSelectedDay] = useState(0); // 0 = Monday

    const maxDayIndex = DAY_NAMES.length - 1;
    const currentTimetable: Period[] = MOCK_TIMETABLE[selectedDay as keyof typeof MOCK_TIMETABLE] || [];

    const navigateToPreviousDay = () => {
        setSelectedDay((current) => Math.max(0, current - 1));
    };

    const navigateToNextDay = () => {
        setSelectedDay((current) => Math.min(maxDayIndex, current + 1));
    };

    const handleBackToDashboard = () => {
        router.push('/(tabs)');
    };

    const renderChildSelector = () => (
        <View style={styles.childSelector}>
            <ThemedText style={styles.selectorTitle} type="defaultSemiBold">
                Select Child
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childScroll}>
                {MOCK_CHILDREN.map((child) => (
                    <TouchableOpacity
                        key={child.id}
                        style={[
                            styles.childCard,
                            selectedChild.id === child.id && { borderColor: theme.colors.primary, borderWidth: 2 }
                        ]}
                        onPress={() => setSelectedChild(child)}
                    >
                        <View style={[styles.childAvatar, { backgroundColor: theme.colors.primary + '20' }]}>
                            <ThemedText style={{ color: theme.colors.primary, fontWeight: '700' }}>
                                {child.avatar}
                            </ThemedText>
                        </View>
                        <ThemedText style={styles.childName} type="defaultSemiBold">
                            {child.name}
                        </ThemedText>
                        <ThemedText style={styles.childClass} lightColor="#666" darkColor="#999">
                            {child.class}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderViewToggle = () => (
        <View style={styles.viewToggle}>
            <TouchableOpacity
                style={[
                    styles.toggleButton,
                    viewMode === 'daily' && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setViewMode('daily')}
            >
                <ThemedText
                    style={[
                        styles.toggleText,
                        viewMode === 'daily' && { color: theme.colors.primaryForeground }
                    ]}
                    type="defaultSemiBold"
                >
                    Daily
                </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.toggleButton,
                    viewMode === 'weekly' && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setViewMode('weekly')}
            >
                <ThemedText
                    style={[
                        styles.toggleText,
                        viewMode === 'weekly' && { color: theme.colors.primaryForeground }
                    ]}
                    type="defaultSemiBold"
                >
                    Weekly
                </ThemedText>
            </TouchableOpacity>
        </View>
    );

    const renderDayNavigation = () => (
        <View style={styles.dayNavigation}>
            <TouchableOpacity
                style={[styles.navButton, { backgroundColor: theme.colors.primary + '20' }]}
                onPress={navigateToPreviousDay}
                disabled={selectedDay === 0}
            >
                <View style={styles.navContent}>
                    <Ionicons
                        name="chevron-back"
                        size={20}
                        color={selectedDay === 0 ? '#ccc' : theme.colors.primary}
                    />
                    <ThemedText style={[styles.navLabel, selectedDay === 0 && styles.navLabelDisabled]}>
                        Previous
                    </ThemedText>
                </View>
            </TouchableOpacity>

            <View style={styles.dayInfo}>
                <ThemedText style={styles.dayName} type="subtitle">
                    {DAY_NAMES[selectedDay]}
                </ThemedText>
                <ThemedText style={styles.childInfo} lightColor="#666" darkColor="#999">
                    {selectedChild.name} • {selectedChild.class}
                </ThemedText>
            </View>

            <TouchableOpacity
                style={[styles.navButton, { backgroundColor: theme.colors.primary + '20' }]}
                onPress={navigateToNextDay}
                disabled={selectedDay === maxDayIndex}
            >
                <View style={styles.navContent}>
                    <ThemedText style={[styles.navLabel, selectedDay === maxDayIndex && styles.navLabelDisabled]}>
                        Next
                    </ThemedText>
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={selectedDay === maxDayIndex ? '#ccc' : theme.colors.primary}
                    />
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderPeriodCard = (period: Period, index: number) => (
        <View key={period.id} style={styles.timelineRow}>
            <View style={styles.timelineTrack}>
                <View
                    style={[
                        styles.timelineDot,
                        { backgroundColor: period.isBreak ? '#f59e0b' : theme.colors.primary }
                    ]}
                />
                {index < currentTimetable.length - 1 && <View style={[styles.timelineLine, { backgroundColor: theme.colors.border }]} />}
            </View>

            <ThemedCard
                style={[
                    styles.periodCard,
                    {
                        borderLeftColor: period.isBreak ? '#f59e0b' : theme.colors.primary,
                        backgroundColor: period.isBreak ? '#f59e0b10' : theme.colors.card,
                    }
                ]}
                padding={16}
            >
            <View style={styles.periodHeader}>
                <View style={styles.periodTime}>
                    <ThemedText style={styles.timeText} type="defaultSemiBold">
                        Time: {period.startTime} - {period.endTime}
                    </ThemedText>
                    <ThemedText style={styles.periodNumber} lightColor="#666" darkColor="#999">
                        Period {period.period}
                    </ThemedText>
                </View>
                {period.isBreak && (
                    <View style={[styles.breakIndicator, { backgroundColor: '#10b981' }]}>
                        <Ionicons name="cafe" size={16} color="white" />
                    </View>
                )}
            </View>

            <View style={styles.periodContent}>
                <ThemedText
                    style={[
                        styles.subjectName,
                        period.isBreak && { color: '#10b981', fontStyle: 'italic' }
                    ]}
                    type="defaultSemiBold"
                >
                    Subject: {period.subject}
                </ThemedText>

                <View style={styles.detailRow}>
                    <Ionicons name="person" size={16} color={theme.colors.primary} />
                    <ThemedText style={styles.detailText} lightColor="#666" darkColor="#999">
                        Teacher: {period.teacher || 'N/A'}
                    </ThemedText>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="location" size={16} color={theme.colors.primary} />
                    <ThemedText style={styles.detailText} lightColor="#666" darkColor="#999">
                        Room/Lab: {period.room || 'N/A'}
                    </ThemedText>
                </View>
            </View>
            </ThemedCard>
        </View>
    );

    const renderWeeklyView = () => (
        <View style={styles.weeklyView}>
            {DAY_NAMES.map((dayName, index) => {
                const dayPeriods = MOCK_TIMETABLE[index as keyof typeof MOCK_TIMETABLE] || [];
                const academicPeriods = dayPeriods.filter(p => !p.isBreak);

                return (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.weekDayCard,
                            { backgroundColor: selectedDay === index ? theme.colors.primary + '10' : theme.colors.card }
                        ]}
                        onPress={() => {
                            setSelectedDay(index);
                            setViewMode('daily');
                        }}
                    >
                        <ThemedText style={styles.weekDayName} type="defaultSemiBold">
                            {dayName}
                        </ThemedText>
                        <ThemedText style={styles.weekDayCount} lightColor="#666" darkColor="#999">
                            {academicPeriods.length} periods
                        </ThemedText>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity style={styles.backButton} onPress={handleBackToDashboard}>
                            <Ionicons name="arrow-back" size={24} color={theme.colors.primaryForeground} />
                        </TouchableOpacity>
                        <View style={styles.headerTitleWrap}>
                            <ThemedText style={styles.headerTitle} type="title" color="primaryForeground">
                                Child Timetable
                            </ThemedText>
                            <ThemedText style={styles.headerSubtitle} color="primaryForeground">
                                {selectedChild.name}
                            </ThemedText>
                        </View>
                        <View style={{ width: 40 }} />
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Child Selector */}
                {renderChildSelector()}

                {/* View Toggle */}
                {renderViewToggle()}

                {/* Day Navigation */}
                {renderDayNavigation()}

                {/* Content */}
                <View style={styles.content}>
                    {viewMode === 'daily' ? (
                        <View style={styles.dailyView}>
                            {currentTimetable.map((period, index) => renderPeriodCard(period, index))}
                        </View>
                    ) : (
                        renderWeeklyView()
                    )}
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingBottom: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    headerTitleWrap: {
        flex: 1,
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 2,
        opacity: 0.9,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    childSelector: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 16,
    },
    selectorTitle: {
        fontSize: 16,
        marginBottom: 12,
    },
    childScroll: {
        marginHorizontal: -24,
        paddingHorizontal: 24,
    },
    childCard: {
        width: 120,
        alignItems: 'center',
        padding: 12,
        marginRight: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    childAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    childName: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 2,
    },
    childClass: {
        fontSize: 12,
        textAlign: 'center',
    },
    viewToggle: {
        flexDirection: 'row',
        marginHorizontal: 24,
        marginBottom: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 8,
        padding: 4,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: 'center',
    },
    toggleText: {
        fontSize: 14,
    },
    dayNavigation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 24,
        marginBottom: 20,
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 12,
    },
    navButton: {
        minWidth: 92,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    navLabel: {
        fontSize: 12,
        color: '#333',
    },
    navLabelDisabled: {
        color: '#ccc',
    },
    dayInfo: {
        alignItems: 'center',
        flex: 1,
    },
    dayName: {
        fontSize: 18,
        marginBottom: 4,
    },
    childInfo: {
        fontSize: 14,
    },
    content: {
        paddingHorizontal: 24,
    },
    dailyView: {
        gap: 12,
    },
    timelineRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    timelineTrack: {
        width: 24,
        alignItems: 'center',
        paddingTop: 16,
    },
    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        marginTop: 4,
        marginBottom: -8,
    },
    periodCard: {
        flex: 1,
        marginBottom: 8,
        borderLeftWidth: 4,
    },
    periodHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    periodTime: {
        flex: 1,
    },
    timeText: {
        fontSize: 16,
        marginBottom: 4,
    },
    periodNumber: {
        fontSize: 12,
    },
    breakIndicator: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    periodContent: {
        gap: 8,
    },
    subjectName: {
        fontSize: 18,
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
    },
    weeklyView: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    weekDayCard: {
        flex: 1,
        minWidth: (width - 48 - 24) / 2,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    weekDayName: {
        fontSize: 16,
        marginBottom: 4,
    },
    weekDayCount: {
        fontSize: 12,
    },
});