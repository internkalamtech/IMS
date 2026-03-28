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

// Recent updates data matching the prototype
const RECENT_UPDATES = [
    {
        id: '1',
        icon: 'book' as const,
        iconColor: '#8b5cf6',
        iconBg: '#8b5cf615',
        title: 'New Homework Assigned',
        subtitle: 'Mathematics - Due on Jan 25',
        time: '2 hours ago',
        hasView: true,
    },
    {
        id: '2',
        icon: 'trending-up' as const,
        iconColor: '#10b981',
        iconBg: '#10b98115',
        title: 'Test Results Published',
        subtitle: 'Science - Score: 92/100',
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
];

export default function ParentDashboard() {
    const { logout, user } = useAuth();
    const { data: dashboardData, refreshing, onRefresh } = useDashboard();
    const { theme } = useTheme();

    const quickActions = DASHBOARD_CONFIG.parent.quickActions;

    const getStatValue = (label: string, defaultValue: string = '0%') => {
        return dashboardData?.stats?.find(s => s.label === label)?.value?.toString() || defaultValue;
    };

    const attendance = getStatValue('Attendance', '88%');
    const avgMarks = getStatValue('Avg Marks', '85%');

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
                {/* Blue Banner Header */}
                <View style={[styles.banner, { backgroundColor: theme.colors.primary }]}>
                    <SafeAreaView edges={['top']}>
                        {/* Top row: welcome + logout */}
                        <View style={styles.headerRow}>
                            <View>
                                <ThemedText style={styles.welcomeText} color="primaryForeground">
                                    Welcome, {user?.name?.split(' ')[0] || 'Priya'} {user?.name?.split(' ')[1] ? user.name.split(' ')[1] : 'Sharma'} 👋
                                </ThemedText>
                                <ThemedText style={styles.subtitleText} color="primaryForeground">
                                    Track your child's progress
                                </ThemedText>
                            </View>
                            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                                <Ionicons name="log-out-outline" size={22} color={theme.colors.primaryForeground} />
                            </TouchableOpacity>
                        </View>

                        {/* Child Info Card inside banner */}
                        <View style={styles.childCardWrapper}>
                            <ThemedCard style={styles.childCard} padding={20}>
                                {/* Child name row */}
                                <View style={styles.childNameRow}>
                                    <View style={[styles.avatarCircle, { backgroundColor: theme.colors.primary + '20' }]}>
                                        <ThemedText style={[styles.avatarText, { color: theme.colors.primary }]}>AK</ThemedText>
                                    </View>
                                    <View>
                                        <ThemedText style={styles.childName} type="defaultSemiBold">Aarav Kumar</ThemedText>
                                        <ThemedText style={styles.childClass} lightColor="#666" darkColor="#999">
                                            Class 7-B • Roll 23
                                        </ThemedText>
                                    </View>
                                </View>

                                {/* Stats row */}
                                <View style={styles.statsRow}>
                                    <View style={[styles.statBox, { backgroundColor: '#10b98115' }]}>
                                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                        <View>
                                            <ThemedText style={styles.statValue} type="defaultSemiBold">
                                                {attendance}
                                            </ThemedText>
                                            <ThemedText style={styles.statLabel} lightColor="#666" darkColor="#999">
                                                Attendance
                                            </ThemedText>
                                        </View>
                                    </View>
                                    <View style={[styles.statBox, { backgroundColor: '#f59e0b15' }]}>
                                        <Ionicons name="trending-up" size={20} color="#f59e0b" />
                                        <View>
                                            <ThemedText style={styles.statValue} type="defaultSemiBold">
                                                {avgMarks}
                                            </ThemedText>
                                            <ThemedText style={styles.statLabel} lightColor="#666" darkColor="#999">
                                                Avg Marks
                                            </ThemedText>
                                        </View>
                                    </View>
                                </View>
                            </ThemedCard>
                        </View>
                    </SafeAreaView>
                </View>

                {/* White / Background content area */}
                <View style={[styles.mainContent, { backgroundColor: theme.colors.background }]}>
                    {/* Quick Actions */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">
                            Quick Actions
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
                                3 new
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
                                <View style={[styles.updateIconBox, { backgroundColor: item.iconBg }]}>
                                    <Ionicons name={item.icon} size={20} color={item.iconColor} />
                                </View>
                                <View style={styles.updateBody}>
                                    <ThemedText style={styles.updateTitle} type="defaultSemiBold">
                                        {item.title}
                                    </ThemedText>
                                    <ThemedText style={styles.updateSubtitle} lightColor="#666" darkColor="#999">
                                        {item.subtitle}
                                    </ThemedText>
                                    <ThemedText style={styles.updateTime} lightColor="#999" darkColor="#666">
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
        paddingBottom: 24,
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
        fontSize: 22,
        fontWeight: '700',
    },
    subtitleText: {
        fontSize: 14,
        marginTop: 4,
        opacity: 0.9,
    },
    logoutBtn: { padding: 6 },

    // Child Card
    childCardWrapper: {
        paddingHorizontal: 16,
    },
    childCard: {
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
    },
    childNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '700',
    },
    childName: { fontSize: 17 },
    childClass: { fontSize: 13, marginTop: 2 },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 12,
        borderRadius: 14,
    },
    statValue: { fontSize: 17 },
    statLabel: { fontSize: 11, marginTop: 2 },

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
