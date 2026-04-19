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

export default function ParentDashboard() {
    const { logout, user } = useAuth();
    const { data: dashboardData, loading, refreshing, onRefresh } = useDashboard();
    const { theme } = useTheme();

    const quickActions = DASHBOARD_CONFIG.parent.quickActions;

    const getStatValue = (label: string, defaultValue: string = '0%') => {
        return dashboardData?.stats?.find(s => s.label === label)?.value || defaultValue;
    };

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primaryForeground} />}
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

                        {/* Child Info Card - Partially overlapping */}
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

                    <QuickActionGrid actions={quickActions} />

                    {/* Recent Updates */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">Recent Updates</ThemedText>
                        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                            <ThemedText style={styles.badgeText} lightColor={theme.colors.primaryForeground} darkColor={theme.colors.primaryForeground}>3 new</ThemedText>
                        </View>
                    </View>
                    <ThemedCard style={styles.updatesCard} padding={0}>
                        {[1, 2].map((item, index) => (
                            <View key={item} style={[
                                styles.updateItem,
                                index !== 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }
                            ]}>
                                <View style={[styles.updateIcon, { backgroundColor: '#3b82f615' }]}>
                                    <Ionicons name="mail" size={20} color="#3b82f6" />
                                </View>
                                <View style={styles.updateContent}>
                                    <ThemedText style={styles.updateTitle} type="defaultSemiBold">Fee Due Reminder</ThemedText>
                                    <ThemedText style={styles.updateSubtitle} lightColor="#666" darkColor="#999">Due Date: 30th Oct</ThemedText>
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
        paddingBottom: 80,
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
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
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
        paddingTop: 80, // Offset for the overlapping card
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
    viewLink: {
        fontSize: 12,
        fontWeight: '600',
    },
});
