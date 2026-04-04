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

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TimetableScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const [selectedChild, setSelectedChild] = useState(MOCK_CHILDREN[0]);
    const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
    const [selectedDay, setSelectedDay] = useState(0); // 0 = Monday

    const currentTimetable = MOCK_TIMETABLE[selectedDay as keyof typeof MOCK_TIMETABLE] || [];

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
                onPress={() => setSelectedDay(Math.max(0, selectedDay - 1))}
                disabled={selectedDay === 0}
            >
                <Ionicons
                    name="chevron-back"
                    size={20}
                    color={selectedDay === 0 ? '#ccc' : theme.colors.primary}
                />
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
                onPress={() => setSelectedDay(Math.min(6, selectedDay + 1))}
                disabled={selectedDay === 6}
            >
                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={selectedDay === 6 ? '#ccc' : theme.colors.primary}
                />
            </TouchableOpacity>
        </View>
    );

    const renderPeriodCard = (period: any) => (
        <ThemedCard key={period.id} style={styles.periodCard} padding={16}>
            <View style={styles.periodHeader}>
                <View style={styles.periodTime}>
                    <ThemedText style={styles.timeText} type="defaultSemiBold">
                        {period.startTime} - {period.endTime}
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
                    {period.subject}
                </ThemedText>

                {!period.isBreak && (
                    <>
                        <View style={styles.detailRow}>
                            <Ionicons name="person" size={16} color={theme.colors.primary} />
                            <ThemedText style={styles.detailText} lightColor="#666" darkColor="#999">
                                {period.teacher}
                            </ThemedText>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="location" size={16} color={theme.colors.primary} />
                            <ThemedText style={styles.detailText} lightColor="#666" darkColor="#999">
                                {period.room}
                            </ThemedText>
                        </View>
                    </>
                )}
            </View>
        </ThemedCard>
    );

    const renderWeeklyView = () => (
        <View style={styles.weeklyView}>
            {DAY_NAMES.slice(0, 5).map((dayName, index) => {
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
                            {dayName.slice(0, 3)}
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
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color={theme.colors.primaryForeground} />
                        </TouchableOpacity>
                        <ThemedText style={styles.headerTitle} type="title" color="primaryForeground">
                            Timetable
                        </ThemedText>
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
                {viewMode === 'daily' && renderDayNavigation()}

                {/* Content */}
                <View style={styles.content}>
                    {viewMode === 'daily' ? (
                        <View style={styles.dailyView}>
                            {currentTimetable.map(renderPeriodCard)}
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
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
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
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
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
    periodCard: {
        marginBottom: 8,
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