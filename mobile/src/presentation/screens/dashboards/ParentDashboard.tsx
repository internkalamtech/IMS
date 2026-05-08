import { DASHBOARD_CONFIG } from '@/core/config/dashboard';
import { useTheme } from '@/core/theme/ThemeContext';
import { AcademicRepository } from '@/data/repositories/academic-repository-impl';
import { QuickActionGrid } from '@/presentation/components/dashboard/QuickActionGrid';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useDashboard } from '@/presentation/hooks/useDashboard';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, RefreshControl, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ParentDashboard() {
    const { logout, user } = useAuth();
    const { data: dashboardData, refreshing, onRefresh } = useDashboard();
    const { theme } = useTheme();
    const router = useRouter();
    const [pendingHomeworkCount, setPendingHomeworkCount] = useState(0);

    const quickActions = DASHBOARD_CONFIG.parent.quickActions;
    const resolvedChildId = '1';

    const getStatValue = (label: string, defaultValue: string = '0%') => {
        return dashboardData?.stats?.find(s => s.label === label)?.value || defaultValue;
    };

    const loadPendingHomeworkCount = useCallback(async () => {
        try {
            const summary = await AcademicRepository.getAcademicSummary(
                resolvedChildId
            );
            setPendingHomeworkCount(summary.pending_homework_count);
        } catch {
            // Preserve the last successful value when refresh fails.
        }
    }, [resolvedChildId]);

    useEffect(() => {
        loadPendingHomeworkCount();
    }, [loadPendingHomeworkCount]);

    const handleRefresh = async () => {
        await Promise.allSettled([onRefresh(), loadPendingHomeworkCount()]);
    };

    const handleHomeworkCounterPress = () => {
        router.push('/academics?initialTab=homework&childId=1');
    };

    const handleQuickActionPress = (action: any) => {
        if (action.route) {
            router.push(action.route);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primaryForeground} />}
            >
                {/* Blue Banner Header */}
                <View style={[styles.banner, { backgroundColor: theme.colors.primary }]}>
                    <SafeAreaView edges={['top']}>
                        <View style={styles.headerContent}>
                            <View>
                                <ThemedText style={styles.userName} type="title" lightColor={theme.colors.primaryForeground} darkColor={theme.colors.primaryForeground}>
                                    Welcome, {user?.name?.split(' ')[0] || 'Priya'} 👋
                                </ThemedText>
                                <ThemedText style={styles.subtitle} lightColor={theme.colors.primaryForeground} darkColor={theme.colors.primaryForeground}>
                                    Track your child&apos;s progress
                                </ThemedText>
                            </View>
                            <TouchableOpacity onPress={logout} style={styles.logoutIcon}>
                                <Ionicons name="log-out-outline" size={24} color={theme.colors.primaryForeground} />
                            </TouchableOpacity>
                        </View>

                        {/* Child Info Card - Fully enclosed in blue dashboard */}
                        <View style={styles.childCardContainer}>
                            <ThemedCard style={styles.childCard} padding={20}>
                                <View style={styles.childHeader}>
                                    <View style={[styles.childAvatar, { backgroundColor: theme.colors.primary + '20' }]}>
                                        <ThemedText style={{ color: theme.colors.primary, fontWeight: '700' }}>AK</ThemedText>
                                    </View>
                                    <View>
                                        <ThemedText style={styles.childName} type="defaultSemiBold">Aarav Kumar</ThemedText>
                                        <ThemedText style={styles.childClass} lightColor="#666" darkColor="#999">Class 7-B • Roll 23</ThemedText>
                                    </View>
                                </View>

                                <View style={styles.childStats}>
                                    <View style={[styles.childStatBox, { backgroundColor: '#10b98115' }]}>
                                        <View style={[styles.statDot, { backgroundColor: '#10b981' }]} />
                                        <View>
                                            <ThemedText style={styles.statValue} type="defaultSemiBold">{getStatValue('Attendance', '88%')}</ThemedText>
                                            <ThemedText style={styles.statLabel} lightColor="#666" darkColor="#999">Attendance</ThemedText>
                                        </View>
                                    </View>
                                    <View style={[styles.childStatBox, { backgroundColor: '#3b82f615' }]}>
                                        <View style={[styles.statDot, { backgroundColor: '#3b82f6' }]} />
                                        <View>
                                            <ThemedText style={styles.statValue} type="defaultSemiBold">{getStatValue('Avg Marks', '85%')}</ThemedText>
                                            <ThemedText style={styles.statLabel} lightColor="#666" darkColor="#999">Avg Marks</ThemedText>
                                        </View>
                                    </View>
                                </View>

                                {/* Pending Homework Counter Card — Issue #294 */}
                                <TouchableOpacity
                                    style={[styles.homeworkCounterCard, { backgroundColor: '#f59e0b15', borderColor: '#f59e0b30' }]}
                                    onPress={handleHomeworkCounterPress}
                                    activeOpacity={0.75}
                                >
                                    <View style={styles.homeworkCounterLeft}>
                                        <View style={[styles.homeworkIconBadge, { backgroundColor: '#f59e0b20' }]}>
                                            <Ionicons name="book-outline" size={18} color="#f59e0b" />
                                        </View>
                                        <View>
                                            <ThemedText style={[styles.homeworkCounterValue, { color: '#f59e0b' }]} type="defaultSemiBold">
                                                {pendingHomeworkCount} Pending
                                            </ThemedText>
                                            <ThemedText style={styles.homeworkCounterLabel} lightColor="#666" darkColor="#999">
                                                Homework assignments
                                            </ThemedText>
                                        </View>
                                    </View>
                                    <View style={[styles.homeworkCounterArrow, { backgroundColor: '#f59e0b20' }]}>
                                        <Ionicons name="chevron-forward" size={16} color="#f59e0b" />
                                    </View>
                                </TouchableOpacity>
                            </ThemedCard>
                        </View>
                    </SafeAreaView>
                </View>

                {/* Main Content */}
                <View style={[styles.mainContent, { backgroundColor: theme.colors.background }]}>
                    {/* Quick Actions */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">Quick Actions</ThemedText>
                    </View>

                    <QuickActionGrid actions={quickActions} onActionPress={handleQuickActionPress} />

                    {/* Recent Updates */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">Recent Updates</ThemedText>
                        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                            <ThemedText style={styles.badgeText} lightColor={theme.colors.primaryForeground} darkColor={theme.colors.primaryForeground}>3 new</ThemedText>
                        </View>
                    </View>
                    <ThemedCard style={styles.updatesCard} padding={0}>
                        {[
                            { icon: 'book', color: '#3b82f6', title: 'New Homework Assigned', subtitle: 'Mathematics - Due on Jan 25', time: '2 hours ago' },
                            { icon: 'checkmark-circle', color: '#10b981', title: 'Test Results Published', subtitle: 'Science - Score: 92/100', time: '1 day ago' },
                            { icon: 'calendar', color: '#f59e0b', title: 'Parent-Teacher Meeting', subtitle: 'January 28, 2026 at 3:00 PM', time: '2 days ago' },
                        ].map((item, index) => (
                            <View key={index} style={[
                                styles.updateItem,
                                index !== 2 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }
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
        paddingBottom: 24,
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
        fontSize: 24,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    logoutIcon: {
        padding: 8,
    },
    childCardContainer: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    childCard: {
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
    },
    childHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    childAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    childName: {
        fontSize: 18,
    },
    childClass: {
        fontSize: 13,
    },
    childStats: {
        flexDirection: 'row',
        gap: 12,
    },
    childStatBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        gap: 10,
    },
    statDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statValue: {
        fontSize: 16,
    },
    statLabel: {
        fontSize: 11,
    },
    mainContent: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 0,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
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
        justifyContent: 'flex-start',
        marginBottom: 32,
    },
    quickActionItem: {
        width: (width - 48) / 4,
        alignItems: 'center',
        marginBottom: 24,
    },
    quickActionIcon: {
        width: 50,
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionLabel: {
        fontSize: 11,
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
        fontSize: 14,
        marginBottom: 2,
    },
    updateSubtitle: {
        fontSize: 12,
    },
    updateTime: {
        fontSize: 11,
    },
    viewLink: {
        fontSize: 12,
        fontWeight: '600',
    },
    // Pending Homework counter card — Issue #294
    homeworkCounterCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
    },
    homeworkCounterLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    homeworkIconBadge: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    homeworkCounterValue: {
        fontSize: 15,
    },
    homeworkCounterLabel: {
        fontSize: 11,
        marginTop: 1,
    },
    homeworkCounterArrow: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

