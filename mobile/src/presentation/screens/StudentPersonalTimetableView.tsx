import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
} from 'react-native';
import { useAuth } from '@/presentation/hooks/useAuth';
import { api } from '@/core/api-client';

interface TimetableEntry {
    id: number;
    class_id: number;
    day: string;
    period_number: number;
    subject: string;
    teacher: string;
    room: string;
    start_time: string;
    end_time: string;
    type: string;
}

interface StudentTimetableData {
    timetable: TimetableEntry[];
    class_id: number;
    class_name: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StudentPersonalTimetableView() {
    const { user } = useAuth();
    const [timetableData, setTimetableData] = useState<StudentTimetableData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
    const [selectedDay, setSelectedDay] = useState<string>('Monday');

    useEffect(() => {
        fetchStudentTimetable();
    }, []);

    const fetchStudentTimetable = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get('/students/academic/timetable');
            setTimetableData(response.data);

            // Set today's day or default to Monday
            const today = new Date();
            const dayName = DAYS_OF_WEEK[today.getDay() - 1] || 'Monday';
            setSelectedDay(dayName);
        } catch (err: any) {
            console.error('Error fetching timetable:', err);
            const errorMsg = err.response?.data?.detail || 'Failed to fetch timetable. Please try again.';
            setError(errorMsg);
            Alert.alert('Error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Get periods for selected day (Daily view)
    const getDayPeriods = (): TimetableEntry[] => {
        if (!timetableData) return [];
        return timetableData.timetable
            .filter((entry) => entry.day === selectedDay)
            .sort((a, b) => a.period_number - b.period_number);
    };

    // Group periods by day (Weekly view)
    const getWeeklyData = (): { day: string; periods: TimetableEntry[] }[] => {
        if (!timetableData) return [];
        return DAYS_OF_WEEK.map((day) => ({
            day,
            periods: timetableData.timetable
                .filter((entry) => entry.day === day)
                .sort((a, b) => a.period_number - b.period_number),
        }));
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.loadingText}>Loading your timetable...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error && !timetableData) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchStudentTimetable}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (!timetableData || timetableData.timetable.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>My Class Schedule</Text>
                        <Text style={styles.className}>{timetableData?.class_name || 'N/A'}</Text>
                    </View>

                    {/* No Data Message */}
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateIcon}>📅</Text>
                        <Text style={styles.emptyStateText}>No timetable available</Text>
                        <Text style={styles.emptyStateSubtext}>
                            Your class timetable will appear here once it's created by the admin.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    const dayPeriods = getDayPeriods();
    const weeklyData = getWeeklyData();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Class Schedule</Text>
                    <Text style={styles.className}>{timetableData.class_name}</Text>
                </View>

                {/* View Mode Toggle */}
                <View style={styles.viewModeContainer}>
                    <TouchableOpacity
                        style={[
                            styles.viewModeButton,
                            viewMode === 'daily' && styles.viewModeButtonActive,
                        ]}
                        onPress={() => setViewMode('daily')}
                    >
                        <Text
                            style={[
                                styles.viewModeButtonText,
                                viewMode === 'daily' && styles.viewModeButtonTextActive,
                            ]}
                        >
                            Daily View
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.viewModeButton,
                            viewMode === 'weekly' && styles.viewModeButtonActive,
                        ]}
                        onPress={() => setViewMode('weekly')}
                    >
                        <Text
                            style={[
                                styles.viewModeButtonText,
                                viewMode === 'weekly' && styles.viewModeButtonTextActive,
                            ]}
                        >
                            Weekly View
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Daily View */}
                {viewMode === 'daily' && (
                    <View>
                        {/* Day Selector */}
                        <View style={styles.daySelectorContainer}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.daySelectorContent}
                            >
                                {DAYS_OF_WEEK.map((day) => (
                                    <TouchableOpacity
                                        key={day}
                                        style={[
                                            styles.dayButton,
                                            selectedDay === day && styles.dayButtonActive,
                                        ]}
                                        onPress={() => setSelectedDay(day)}
                                    >
                                        <Text
                                            style={[
                                                styles.dayButtonText,
                                                selectedDay === day && styles.dayButtonTextActive,
                                            ]}
                                        >
                                            {day.slice(0, 3)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Periods List - Daily */}
                        {dayPeriods.length > 0 ? (
                            <View style={styles.periodsContainer}>
                                <Text style={styles.sectionTitle}>{selectedDay}</Text>
                                <FlatList
                                    data={dayPeriods}
                                    keyExtractor={(item) => `${item.id}-${item.day}`}
                                    scrollEnabled={false}
                                    renderItem={({ item, index }) => (
                                        <PeriodCard period={item} isLast={index === dayPeriods.length - 1} />
                                    )}
                                />
                            </View>
                        ) : (
                            <View style={styles.noPeriods}>
                                <Text style={styles.noPeriodText}>No classes scheduled for {selectedDay}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Weekly View */}
                {viewMode === 'weekly' && (
                    <View style={styles.weeklyContainer}>
                        {weeklyData.map((dayData) => (
                            <View key={dayData.day} style={styles.dayCard}>
                                <View style={styles.dayCardHeader}>
                                    <Text style={styles.dayCardTitle}>{dayData.day}</Text>
                                    <Text style={styles.dayCardCount}>
                                        {dayData.periods.length > 0
                                            ? `${dayData.periods.length} class${dayData.periods.length > 1 ? 'es' : ''}`
                                            : 'No classes'}
                                    </Text>
                                </View>

                                {dayData.periods.length > 0 ? (
                                    <View style={styles.dayCardPeriods}>
                                        {dayData.periods.map((period, idx) => (
                                            <View key={`${period.id}-${idx}`} style={styles.miniPeriodCard}>
                                                <View style={styles.miniPeriodTime}>
                                                    <Text style={styles.miniPeriodTimeText}>
                                                        {period.start_time} - {period.end_time}
                                                    </Text>
                                                </View>
                                                <View style={styles.miniPeriodDetails}>
                                                    <Text style={styles.miniPeriodSubject}>{period.subject}</Text>
                                                    <Text style={styles.miniPeriodTeacher}>
                                                        {period.teacher} • {period.room}
                                                    </Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <View style={styles.dayCardEmpty}>
                                        <Text style={styles.dayCardEmptyText}>No classes</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Refresh Button */}
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={fetchStudentTimetable}
                >
                    <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
                </TouchableOpacity>

                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

/**
 * PeriodCard Component - Displays a single period/class
 * Shows: Subject, Teacher, Room, Time Range
 */
interface PeriodCardProps {
    period: TimetableEntry;
    isLast: boolean;
}

function PeriodCard({ period, isLast }: PeriodCardProps) {
    const getPeriodTypeColor = (type: string) => {
        switch (type) {
            case 'BREAK':
                return '#FF9800';
            case 'FREE_PERIOD':
                return '#9C27B0';
            default:
                return '#4CAF50';
        }
    };

    return (
        <View style={[styles.periodCard, !isLast && styles.periodCardWithBorder]}>
            {/* Period Time and Number */}
            <View style={[styles.periodNumber, { backgroundColor: getPeriodTypeColor(period.type) }]}>
                <Text style={styles.periodNumberText}>P{period.period_number}</Text>
            </View>

            {/* Period Details */}
            <View style={styles.periodDetails}>
                {/* Time Range */}
                <Text style={styles.periodTime}>
                    {period.start_time} - {period.end_time}
                </Text>

                {/* Subject */}
                <Text style={styles.periodSubject}>{period.subject}</Text>

                {/* Teacher and Room */}
                <View style={styles.periodMeta}>
                    <Text style={styles.periodMetaText}>👨‍🏫 {period.teacher}</Text>
                    <Text style={styles.periodMetaText}>🚪 {period.room}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    errorText: {
        fontSize: 18,
        color: '#d32f2f',
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: '600',
    },
    retryButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    
    /* Header */
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    className: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },

    /* View Mode Toggle */
    viewModeContainer: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        gap: 8,
    },
    viewModeButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        alignItems: 'center',
    },
    viewModeButtonActive: {
        backgroundColor: '#4CAF50',
        borderColor: '#388E3C',
    },
    viewModeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    viewModeButtonTextActive: {
        color: '#fff',
    },

    /* Day Selector */
    daySelectorContainer: {
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    daySelectorContent: {
        paddingHorizontal: 12,
        gap: 8,
    },
    dayButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#d0d0d0',
        minWidth: 50,
        alignItems: 'center',
    },
    dayButtonActive: {
        backgroundColor: '#4CAF50',
        borderColor: '#388E3C',
    },
    dayButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    dayButtonTextActive: {
        color: '#fff',
    },

    /* Periods Container - Daily View */
    periodsContainer: {
        paddingHorizontal: 12,
        paddingVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 12,
    },

    /* Period Card */
    periodCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        gap: 12,
    },
    periodCardWithBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    periodNumber: {
        width: 50,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    periodNumberText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },

    /* Period Details */
    periodDetails: {
        flex: 1,
        justifyContent: 'space-between',
    },
    periodTime: {
        fontSize: 13,
        color: '#999',
        fontWeight: '500',
        marginBottom: 4,
    },
    periodSubject: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    periodMeta: {
        flexDirection: 'row',
        gap: 16,
    },
    periodMetaText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },

    /* No Periods */
    noPeriods: {
        paddingHorizontal: 12,
        paddingVertical: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noPeriodText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '500',
    },

    /* Empty State */
    emptyState: {
        paddingHorizontal: 20,
        paddingVertical: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyStateIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        lineHeight: 20,
    },

    /* Weekly View */
    weeklyContainer: {
        paddingHorizontal: 12,
        paddingVertical: 16,
        gap: 12,
    },
    dayCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dayCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dayCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    dayCardCount: {
        fontSize: 13,
        color: '#999',
        fontWeight: '500',
    },
    dayCardPeriods: {
        gap: 10,
    },
    dayCardEmpty: {
        paddingVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayCardEmptyText: {
        fontSize: 14,
        color: '#ccc',
        fontWeight: '500',
    },

    /* Mini Period Card (Weekly) */
    miniPeriodCard: {
        flexDirection: 'row',
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 10,
        gap: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    miniPeriodTime: {
        justifyContent: 'center',
        minWidth: 60,
    },
    miniPeriodTimeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    miniPeriodDetails: {
        flex: 1,
    },
    miniPeriodSubject: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    miniPeriodTeacher: {
        fontSize: 12,
        color: '#999',
    },

    /* Refresh Button */
    refreshButton: {
        marginHorizontal: 12,
        marginTop: 16,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    refreshButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
