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
import { Dimensions, RefreshControl, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
    const { logout, user } = useAuth();
    const { data: dashboardData, loading, refreshing, onRefresh } = useDashboard();
    const { theme, isDark } = useTheme();

    const quickActions = DASHBOARD_CONFIG.admin.quickActions;

    const getStatValue = (label: string, defaultValue: string = '0') => {
        return dashboardData?.stats?.find(s => s.label === label)?.value || defaultValue;
    };

    const stats = [
        { title: 'Total Students', value: getStatValue('Total Students'), icon: 'people', color: '#fff' },
        { title: 'Total Teachers', value: getStatValue('Total Teachers'), icon: 'school', color: '#fff' },
    ];

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle={isDark ? "light-content" : "light-content"} />
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
                                <ThemedText style={styles.userName} type="title" color="primaryForeground">
                                    {user?.name || 'Admin'}
                                </ThemedText>
                                <ThemedText style={styles.subtitle} color="primaryForeground">
                                    Institute Management Overview
                                </ThemedText>
                            </View>
                            <TouchableOpacity onPress={logout} style={styles.logoutIcon}>
                                <Ionicons name="log-out-outline" size={24} color={theme.colors.primaryForeground} />
                            </TouchableOpacity>
                        </View>

                        {/* Banner Stats */}
                        <View style={styles.bannerStats}>
                            {stats.map((stat, index) => (
                                <View key={index} style={[styles.bannerStatCard, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                                    <View style={styles.statIconContainer}>
                                        <Ionicons name={stat.icon as any} size={24} color={theme.colors.primaryForeground} />
                                    </View>
                                    <View>
                                        <ThemedText style={styles.bannerStatValue} type="title" color="primaryForeground">{stat.value}</ThemedText>
                                        <ThemedText style={styles.bannerStatTitle} color="primaryForeground">{stat.title}</ThemedText>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </SafeAreaView>
                </View>

                {/* Main Content */}
                <View style={[styles.mainContent, { backgroundColor: theme.colors.background }]}>
                    {/* Quick Actions */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">Quick Actions</ThemedText>
                    </View>

                    <QuickActionGrid actions={quickActions} />

                    {/* Recent Updates */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">Recent Updates</ThemedText>
                        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                            <ThemedText style={styles.badgeText} color="primaryForeground">3 new</ThemedText>
                        </View>
                    </View>
                    <ThemedCard style={styles.updatesCard} padding={0}>
                        {[1, 2, 3].map((item, index) => (
                            <View key={item} style={[
                                styles.updateItem,
                                index !== 2 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }
                            ]}>
                                <View style={[styles.updateIcon, { backgroundColor: theme.colors.primary + '10' }]}>
                                    <Ionicons name="people-outline" size={20} color={theme.colors.primary} />
                                </View>
                                <View style={styles.updateContent}>
                                    <ThemedText style={styles.updateTitle} type="defaultSemiBold">New Student Enrolled</ThemedText>
                                    <ThemedText style={styles.updateSubtitle} lightColor="#666" darkColor="#999">Class 7-B • Roll 24</ThemedText>
                                    <ThemedText style={styles.updateTime} lightColor="#999" darkColor="#aaa">2 hours ago</ThemedText>
                                </View>
                                <TouchableOpacity>
                                    <ThemedText style={styles.viewLink} type="link">View →</ThemedText>
                                </TouchableOpacity>
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
        fontSize: 28,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 16,
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
        fontSize: 22,
        fontWeight: '700',
    },
    bannerStatTitle: {
        fontSize: 12,
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
        fontSize: 20,
        fontWeight: '700',
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
        width: 60,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionLabel: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
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
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    updateContent: {
        flex: 1,
    },
    updateTitle: {
        fontSize: 15,
        marginBottom: 2,
    },
    updateSubtitle: {
        fontSize: 13,
        marginBottom: 4,
    },
    updateTime: {
        fontSize: 11,
    },
    viewLink: {
        fontSize: 13,
        fontWeight: '600',
    },
});
