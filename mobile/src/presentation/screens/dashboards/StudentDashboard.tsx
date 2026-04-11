import { DASHBOARD_CONFIG } from '@/core/config/dashboard';
import { useTheme } from '@/core/theme/ThemeContext';
import { QuickActionGrid } from '@/presentation/components/dashboard/QuickActionGrid';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useDashboard } from '@/presentation/hooks/useDashboard';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Recent updates matching prototype
const RECENT_UPDATES = [
    {
        id: '1',
        icon: 'book' as const,
        iconColor: '#8b5cf6',
        iconBg: '#8b5cf615',
        title: 'Mathematics Homework Assigned',
        subtitle: 'Chapter 5 - Algebra',
        time: '2 hours ago',
        hasView: true,
    },
    {
        id: '2',
        icon: 'document-text' as const,
        iconColor: '#10b981',
        iconBg: '#10b98115',
        title: 'Science Test Result Published',
        subtitle: 'Score: 85/100',
        time: '5 hours ago',
        hasView: true,
    },
    {
        id: '3',
        icon: 'notifications' as const,
        iconColor: '#f59e0b',
        iconBg: '#f59e0b15',
        title: 'Sports Day Announcement',
        subtitle: 'January 25, 2026',
        time: '1 day ago',
        hasView: false,
    },
    {
        id: '4',
        icon: 'cash' as const,
        iconColor: '#ef4444',
        iconBg: '#ef444415',
        title: 'Fee Payment Reminder',
        subtitle: 'Due: January 30, 2026',
        time: '2 days ago',
        hasView: true,
    },
];

export default function StudentDashboard() {
    const { logout, user } = useAuth();
    const { data: dashboardData, refreshing, onRefresh } = useDashboard();
    const { theme } = useTheme();

    const quickActions = DASHBOARD_CONFIG.student.quickActions;

    const getStatValue = (label: string, defaultValue: string = '0') => {
        return dashboardData?.stats?.find(s => s.label === label)?.value?.toString() || defaultValue;
    };

    const attendance = getStatValue('Attendance', '92%');
    const avgScore = getStatValue('Avg Score', '8.5');

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primaryForeground}
                    />
                }
            >
                {/* Blue Banner */}
                <View
                    style={[
                        styles.banner,
                        { backgroundColor: theme.colors.primary },
                    ]}
                >
                    <SafeAreaView edges={['top']}>
                        {/* Header row */}
                        <View style={styles.headerRow}>
                            <View>
                                <ThemedText style={styles.welcomeText} color="primaryForeground">
                                    Hi, {user?.name?.split(' ')[0] || 'Student'} 👋
                                </ThemedText>
                                <ThemedText style={styles.subtitleText} color="primaryForeground">
                                    Ready to learn something new today?
                                </ThemedText>
                            </View>
                            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                                <Ionicons
                                    name="log-out-outline"
                                    size={22}
                                    color={theme.colors.primaryForeground}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Banner stat cards */}
                        <View style={styles.bannerStats}>
                            <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                                <View style={styles.statIconWrap}>
                                    <Ionicons
                                        name="trending-up"
                                        size={22}
                                        color={theme.colors.primaryForeground}
                                    />
                                </View>
                                <View>
                                    <ThemedText style={styles.statValue} color="primaryForeground">
                                        {attendance}
                                    </ThemedText>
                                    <ThemedText style={styles.statLabel} color="primaryForeground">
                                        Attendance
                                    </ThemedText>
                                </View>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                                <View style={styles.statIconWrap}>
                                    <Ionicons
                                        name="star"
                                        size={22}
                                        color={theme.colors.primaryForeground}
                                    />
                                </View>
                                <View>
                                    <ThemedText style={styles.statValue} color="primaryForeground">
                                        {avgScore}
                                    </ThemedText>
                                    <ThemedText style={styles.statLabel} color="primaryForeground">
                                        Avg Score
                                    </ThemedText>
                                </View>
                            </View>
                        </View>
                    </SafeAreaView>
                </View>

                {/* Main content */}
                <View
                    style={[
                        styles.mainContent,
                        { backgroundColor: theme.colors.background },
                    ]}
                >
                    {/* Academic Zone */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">
                            Academic Zone
                        </ThemedText>
                    </View>
                    <QuickActionGrid actions={quickActions} />

                    {/* Recent Updates */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">
                            Recent Updates
                        </ThemedText>
                        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                            <ThemedText style={styles.badgeText} color="primaryForeground">
                                4 new
                            </ThemedText>
                        </View>
                    </View>

                    <ThemedCard style={styles.updatesCard} padding={0}>
                        {RECENT_UPDATES.map((item, index) => (
                            <View
                                key={item.id}
                                style={[
                                    styles.updateRow,
                                    index < RECENT_UPDATES.length - 1 && {
                                        borderBottomWidth: 1,
                                        borderBottomColor: theme.colors.border,
                                    },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.updateIconBox,
                                        { backgroundColor: item.iconBg },
                                    ]}
                                >
                                    <Ionicons
                                        name={item.icon}
                                        size={20}
                                        color={item.iconColor}
                                    />
                                </View>
                                <View style={styles.updateBody}>
                                    <ThemedText
                                        style={styles.updateTitle}
                                        type="defaultSemiBold"
                                    >
                                        {item.title}
                                    </ThemedText>
                                    <ThemedText
                                        style={styles.updateSubtitle}
                                        lightColor="#666"
                                        darkColor="#999"
                                    >
                                        {item.subtitle}
                                    </ThemedText>
                                    <ThemedText
                                        style={styles.updateTime}
                                        lightColor="#999"
                                        darkColor="#666"
                                    >
                                        {item.time}
                                    </ThemedText>
                                </View>
                                {item.hasView && (
                                    <TouchableOpacity>
                                        <ThemedText style={styles.viewLink} type="link">
                                            View →
                                        </ThemedText>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </ThemedCard>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingBottom: 20 },

    // Banner
    banner: {
        paddingBottom: 28,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 20,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: '700',
    },
    subtitleText: {
        fontSize: 14,
        marginTop: 4,
        opacity: 0.9,
    },
    logoutBtn: { padding: 6 },

    // Stat cards in banner
    bannerStats: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
    },
    statCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 18,
        gap: 12,
    },
    statIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 11,
        opacity: 0.85,
    },

    // Main content
    mainContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 28,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 10,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },

    // Updates
    updatesCard: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 32,
    },
    updateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    updateIconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    updateBody: { flex: 1 },
    updateTitle: { fontSize: 14, marginBottom: 2 },
    updateSubtitle: { fontSize: 12, marginBottom: 2 },
    updateTime: { fontSize: 11 },
    viewLink: { fontSize: 12, fontWeight: '600' },
});
