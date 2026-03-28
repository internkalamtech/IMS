import { useTheme } from '@/core/theme/ThemeContext';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { useAuth } from '@/presentation/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AlertItem = {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBg: string;
    title: string;
    subtitle: string;
    time: string;
    isNew: boolean;
};

const PARENT_ALERTS: AlertItem[] = [
    {
        id: '1',
        icon: 'book',
        iconColor: '#8b5cf6',
        iconBg: '#8b5cf615',
        title: 'New Homework Assigned',
        subtitle: 'Mathematics - Due on Jan 25',
        time: '2 hours ago',
        isNew: true,
    },
    {
        id: '2',
        icon: 'trending-up',
        iconColor: '#10b981',
        iconBg: '#10b98115',
        title: 'Test Results Published',
        subtitle: 'Science - Score: 92/100',
        time: '5 hours ago',
        isNew: true,
    },
    {
        id: '3',
        icon: 'notifications',
        iconColor: '#f59e0b',
        iconBg: '#f59e0b15',
        title: 'Sports Day Announcement',
        subtitle: 'January 25, 2026',
        time: '1 day ago',
        isNew: true,
    },
    {
        id: '4',
        icon: 'cash',
        iconColor: '#ef4444',
        iconBg: '#ef444415',
        title: 'Fee Payment Reminder',
        subtitle: 'Due: January 30, 2026',
        time: '2 days ago',
        isNew: false,
    },
    {
        id: '5',
        icon: 'calendar',
        iconColor: '#3b82f6',
        iconBg: '#3b82f615',
        title: 'Parent-Teacher Meeting',
        subtitle: 'Scheduled: Feb 5, 2026',
        time: '3 days ago',
        isNew: false,
    },
];

const STUDENT_ALERTS: AlertItem[] = [
    {
        id: '1',
        icon: 'book',
        iconColor: '#8b5cf6',
        iconBg: '#8b5cf615',
        title: 'Mathematics Homework Assigned',
        subtitle: 'Chapter 5 - Algebra',
        time: '2 hours ago',
        isNew: true,
    },
    {
        id: '2',
        icon: 'document-text',
        iconColor: '#10b981',
        iconBg: '#10b98115',
        title: 'Science Test Result Published',
        subtitle: 'Score: 85/100',
        time: '5 hours ago',
        isNew: true,
    },
    {
        id: '3',
        icon: 'notifications',
        iconColor: '#f59e0b',
        iconBg: '#f59e0b15',
        title: 'Sports Day Announcement',
        subtitle: 'January 25, 2026',
        time: '1 day ago',
        isNew: true,
    },
    {
        id: '4',
        icon: 'cash',
        iconColor: '#ef4444',
        iconBg: '#ef444415',
        title: 'Fee Payment Reminder',
        subtitle: 'Due: January 30, 2026',
        time: '2 days ago',
        isNew: true,
    },
    {
        id: '5',
        icon: 'school',
        iconColor: '#3b82f6',
        iconBg: '#3b82f615',
        title: 'Exam Timetable Released',
        subtitle: 'Final exams start Feb 10',
        time: '3 days ago',
        isNew: false,
    },
];

export default function AlertsTab() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const [readIds, setReadIds] = useState<Set<string>>(new Set());

    const alerts = user?.role === 'student' ? STUDENT_ALERTS : PARENT_ALERTS;
    const newCount = alerts.filter(a => a.isNew && !readIds.has(a.id)).length;

    const markAllRead = () => {
        setReadIds(new Set(alerts.map(a => a.id)));
    };

    const markRead = (id: string) => {
        setReadIds(prev => new Set([...prev, id]));
    };

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
            <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <View style={styles.headerRow}>
                    <View>
                        <ThemedText style={styles.headerTitle} color="primaryForeground">
                            Alerts
                        </ThemedText>
                        {newCount > 0 && (
                            <ThemedText style={styles.headerSubtitle} color="primaryForeground">
                                {newCount} new notification{newCount !== 1 ? 's' : ''}
                            </ThemedText>
                        )}
                    </View>
                    {newCount > 0 && (
                        <TouchableOpacity
                            onPress={markAllRead}
                            style={[styles.markAllBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                        >
                            <ThemedText style={styles.markAllText} color="primaryForeground">
                                Mark all read
                            </ThemedText>
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {alerts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons
                            name="notifications-off-outline"
                            size={64}
                            color={theme.colors.border}
                        />
                        <ThemedText style={styles.emptyTitle} type="subtitle">
                            No Alerts
                        </ThemedText>
                        <ThemedText lightColor="#999" darkColor="#666">
                            You&apos;re all caught up!
                        </ThemedText>
                    </View>
                ) : (
                    <ThemedCard style={styles.alertsCard} padding={0}>
                        {alerts.map((item, index) => {
                            const isUnread = item.isNew && !readIds.has(item.id);
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => markRead(item.id)}
                                    style={[
                                        styles.alertRow,
                                        isUnread && {
                                            backgroundColor: theme.colors.primary + '08',
                                        },
                                        index < alerts.length - 1 && {
                                            borderBottomWidth: 1,
                                            borderBottomColor: theme.colors.border,
                                        },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.alertIcon,
                                            { backgroundColor: item.iconBg },
                                        ]}
                                    >
                                        <Ionicons
                                            name={item.icon}
                                            size={20}
                                            color={item.iconColor}
                                        />
                                    </View>
                                    <View style={styles.alertBody}>
                                        <View style={styles.alertTitleRow}>
                                            <ThemedText
                                                style={styles.alertTitle}
                                                type="defaultSemiBold"
                                                numberOfLines={1}
                                            >
                                                {item.title}
                                            </ThemedText>
                                            {isUnread && (
                                                <View
                                                    style={[
                                                        styles.unreadDot,
                                                        { backgroundColor: theme.colors.primary },
                                                    ]}
                                                />
                                            )}
                                        </View>
                                        <ThemedText
                                            style={styles.alertSubtitle}
                                            lightColor="#666"
                                            darkColor="#999"
                                        >
                                            {item.subtitle}
                                        </ThemedText>
                                        <ThemedText
                                            style={styles.alertTime}
                                            lightColor="#999"
                                            darkColor="#666"
                                        >
                                            {item.time}
                                        </ThemedText>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ThemedCard>
                )}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Header
    header: {
        paddingBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 13,
        marginTop: 4,
        opacity: 0.85,
    },
    markAllBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    markAllText: {
        fontSize: 13,
        fontWeight: '600',
    },

    // Scroll
    scrollView: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 32 },

    // Empty state
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        gap: 12,
    },
    emptyTitle: { fontSize: 18, marginTop: 8 },

    // Alerts card
    alertsCard: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    alertRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    alertIcon: {
        width: 42,
        height: 42,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertBody: { flex: 1 },
    alertTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    alertTitle: { fontSize: 14, flex: 1 },
    alertSubtitle: { fontSize: 12, marginTop: 2 },
    alertTime: { fontSize: 11, marginTop: 3 },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});
