import { DASHBOARD_CONFIG } from '@/core/config/dashboard';
import { useTheme } from '@/core/theme/ThemeContext';
import { QuickActionGrid } from '@/presentation/components/dashboard/QuickActionGrid';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useDashboard } from '@/presentation/hooks/useDashboard';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, RefreshControl, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');

export default function StudentDashboard() {
    const { logout, user } = useAuth();
    const { data: dashboardData, loading, refreshing, onRefresh } = useDashboard();
    const { theme, isDark } = useTheme();

    const quickActions = DASHBOARD_CONFIG.student.quickActions;

    const getStatValue = (label: string, defaultValue: string = '0') => {
        return dashboardData?.stats?.find(s => s.label === label)?.value || defaultValue;
    };

    const handleQuickActionPress = (action: any) => {
        if (action.title === 'Timetable') {
            router.push('/student-timetable' as any);
        } else if (action.title === 'Results') {
            // TODO: Add Results screen route
            console.log('Results action clicked');
        } else if (action.title === 'Homework') {
            router.push('/homework' as any);
        } else if (action.title === 'Library') {
            // TODO: Add Library screen route
            console.log('Library action clicked');
        } else if (action.title === 'Attendance') {
            router.push('/attendance' as any);
        } else if (action.title === 'Profile') {
            router.push('/student-profile' as any);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle={ theme.dark ? "light-content" : "dark-content" } backgroundColor={theme.colors.background} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
            >
                {/* Blue Banner Header */}
                <View style={[styles.banner, { backgroundColor: theme.colors.primary }]}>
                    <SafeAreaView edges={['top']}>
                        <View style={styles.headerContent}>
                            <View>
                                <ThemedText style={styles.userName} type="title" lightColor={theme.colors.primaryForeground} darkColor={theme.colors.primaryForeground}>
                                    Hi, {user?.name?.split(' ')[0] || 'Student'} 👋
                                </ThemedText>
                                <ThemedText style={styles.subtitle} lightColor={theme.colors.primaryForeground} darkColor={theme.colors.primaryForeground}>
                                    Ready to learn something new today?
                                </ThemedText>
                            </View>
                            <TouchableOpacity onPress={logout} style={styles.logoutIcon}>
                                <Ionicons name="log-out-outline" size={24} color={theme.colors.primaryForeground} />
                            </TouchableOpacity>
                        </View>

                        {/* Banner Stats */}
                        <View style={styles.bannerStats}>
                            <View style={[styles.bannerStatCard, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                                <View style={styles.statIconContainer}>
                                    <Ionicons name="trending-up" size={24} color={theme.colors.primaryForeground} />
                                </View>
                                <View>
                                    <ThemedText style={styles.bannerStatValue} type="title" lightColor={theme.colors.primaryForeground} darkColor={theme.colors.primaryForeground}>
                                        {getStatValue('Attendance', '92%')}
                                    </ThemedText>
                                    <ThemedText style={styles.bannerStatTitle} lightColor={theme.colors.primaryForeground} darkColor={theme.colors.primaryForeground}>
                                        Attendance
                                    </ThemedText>
                                </View>
                            </View>
                            <View style={[styles.bannerStatCard, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                                <View style={styles.statIconContainer}>
                                    <Ionicons name="star" size={24} color={theme.colors.primaryForeground} />
                                </View>
                                <View>
                                    <ThemedText style={styles.bannerStatValue} type="title" lightColor={theme.colors.primaryForeground} darkColor={theme.colors.primaryForeground}>
                                        {getStatValue('Avg Score', '8.5')}
                                    </ThemedText>
                                    <ThemedText style={styles.bannerStatTitle} lightColor={theme.colors.primaryForeground} darkColor={theme.colors.primaryForeground}>
                                        Avg Score
                                    </ThemedText>
                                </View>
                            </View>
                        </View>
                    </SafeAreaView>
                </View>

                {/* Main Content */}
                <View style={[styles.mainContent, { backgroundColor: theme.colors.background }]}>
                    {/* Quick Actions */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">Academic Zone</ThemedText>
                    </View>

                     <QuickActionGrid actions={quickActions} onActionPress={handleQuickActionPress} />
                    {/* Recent Updates */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">Recent Updates</ThemedText>
                        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                            <ThemedText style={styles.badgeText} lightColor={theme.colors.primaryForeground} darkColor={theme.colors.primaryForeground}>4 new</ThemedText>
                        </View>
                    </View>
                    <ThemedCard style={styles.updatesCard} padding={0}>
                        {[
                            { icon: 'book', color: '#3b82f6', title: 'Mathematics Homework Assigned', subtitle: 'Chapter 5 - Algebra', time: '2 hours ago' },
                            { icon: 'school', color: '#f59e0b', title: 'Science Test Result Published', subtitle: 'Score: 85/100', time: '5 hours ago' },
                            { icon: 'megaphone', color: '#10b981', title: 'Sports Day Announcement', subtitle: 'January 25, 2026', time: '1 day ago' },
                            { icon: 'mail', color: '#ef4444', title: 'Fee Payment Reminder', subtitle: 'Due: January 30, 2026', time: '2 days ago' },
                        ].map((item, index) => (
                            <View key={index} style={[
                                styles.updateItem,
                                index !== 3 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }
                            ]}>
                                <View style={[styles.updateIcon, { backgroundColor: `${item.color}15` }]}>
                                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                                </View>
                                <View style={styles.updateContent}>
                                    <ThemedText style={styles.updateTitle} type="defaultSemiBold">{item.title}</ThemedText>
                                    <ThemedText style={styles.updateSubtitle} lightColor="#666" darkColor="#999">{item.subtitle}</ThemedText>
                                </View>
                                <View>
                                    <ThemedText style={[styles.updateTime, { fontSize: 11 }]} lightColor="#999" darkColor="#666">{item.time}</ThemedText>
                                    <TouchableOpacity style={{ marginTop: 4 }}>
                                        <ThemedText style={styles.viewLink} type="link">View →</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </ThemedCard>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    banner: {
        paddingBottom: 30,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
    },
    userName: {
        marginBottom: 4,
    },
    subtitle: {
        marginTop: 4,
    },
    logoutIcon: {
        padding: 8,
    },
    bannerStats: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
    },
    bannerStatCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        gap: 12,
    },
    statIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerStatValue: {
        marginBottom: 4,
    },
    bannerStatTitle: {
        marginTop: 4,
    },
    mainContent: {
        flex: 1,
        marginTop: 0,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        marginBottom: 4,
    },
    badge: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 12,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    quickActionItem: {
        width: (width - 48 - 40) / 3,
        alignItems: 'center',
        marginBottom: 24,
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionLabel: {
        textAlign: 'center',
    },
    updatesCard: {
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 40,
    },
    updateItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    updateIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    updateContent: {
        flex: 1,
    },
    updateTitle: {
        marginBottom: 2,
    },
    updateSubtitle: {
        marginBottom: 4,
    },
    updateTime: {
        fontSize: 11,
    },
    viewLink: {
        fontWeight: '600',
    },
});
