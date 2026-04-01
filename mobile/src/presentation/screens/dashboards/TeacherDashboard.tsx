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

export default function TeacherDashboard() {
    const { logout, user } = useAuth();
    const { data: dashboardData, loading, refreshing, onRefresh } = useDashboard();
    const { theme } = useTheme();

    const quickActions = DASHBOARD_CONFIG.teacher.quickActions;

    const upcomingClasses = [
        { id: 1, subject: 'Mathematics', class: 'Class 10-A', time: '09:00 AM', color: '#3b82f6' },
        { id: 2, subject: 'Science', class: 'Class 9-B', time: '10:30 AM', color: '#10b981' },
        { id: 3, subject: 'Physics', class: 'Class 11-A', time: '12:00 PM', color: '#a855f7' },
    ];

    const getStatValue = (label: string, defaultValue: string = '0') => {
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
                                <ThemedText style={styles.userName} type="title" color="primaryForeground">
                                    Hello, {user?.name?.split(' ')[0] || 'Teacher'} 👋
                                </ThemedText>
                                <ThemedText style={styles.subtitle} color="primaryForeground">
                                    Your academic day at a glance
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
                                    <Ionicons name="people" size={24} color={theme.colors.primaryForeground} />
                                </View>
                                <View>
                                    <ThemedText style={styles.bannerStatValue} type="title" color="primaryForeground">{getStatValue('Total Students', '42')}</ThemedText>
                                    <ThemedText style={styles.bannerStatTitle} color="primaryForeground">My Students</ThemedText>
                                </View>
                            </View>
                            <View style={[styles.bannerStatCard, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                                <View style={styles.statIconContainer}>
                                    <Ionicons name="time" size={24} color={theme.colors.primaryForeground} />
                                </View>
                                <View>
                                    <ThemedText style={styles.bannerStatValue} type="title" color="primaryForeground">{getStatValue('Today\'s Classes', '5')}</ThemedText>
                                    <ThemedText style={styles.bannerStatTitle} color="primaryForeground">Classes Today</ThemedText>
                                </View>
                            </View>
                        </View>
                    </SafeAreaView>
                </View>

                {/* Main Content */}
                <View style={[styles.mainContent, { backgroundColor: theme.colors.background }]}>
                    {/* Quick Actions */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">Teacher Tools</ThemedText>
                    </View>

                    <QuickActionGrid actions={quickActions} />

                    {/* Upcoming Classes */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">Upcoming Classes</ThemedText>
                    </View>
                    <ThemedCard style={styles.updatesCard} padding={0}>
                        {upcomingClasses.map((item, index) => (
                            <View key={item.id} style={[
                                styles.updateItem,
                                index !== upcomingClasses.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }
                            ]}>
                                <View style={[styles.classColorBar, { backgroundColor: item.color }]} />
                                <View style={styles.updateContent}>
                                    <ThemedText style={styles.updateTitle} type="defaultSemiBold">{item.subject}</ThemedText>
                                    <ThemedText style={styles.updateSubtitle} lightColor="#666" darkColor="#999">{item.class}</ThemedText>
                                </View>
                                <View style={[styles.timeTag, { backgroundColor: theme.colors.primary + '10' }]}>
                                    <ThemedText style={{ color: theme.colors.primary, fontSize: 12 }} type="defaultSemiBold">{item.time}</ThemedText>
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
        fontSize: 26,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 15,
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
        fontSize: 20,
        fontWeight: '700',
    },
    bannerStatTitle: {
        fontSize: 11,
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
        fontSize: 18,
        fontWeight: '700',
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
    classColorBar: {
        width: 4,
        height: 40,
        borderRadius: 2,
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
    },
    timeTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
});