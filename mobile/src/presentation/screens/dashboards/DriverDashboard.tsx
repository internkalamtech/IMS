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

export default function DriverDashboard() {
    const { logout, user } = useAuth();
    const { data: dashboardData, refreshing, onRefresh } = useDashboard();
    const { theme } = useTheme();

    // Safe access to avoid build errors if 'driver' is not yet in DASHBOARD_CONFIG
    const quickActions = (DASHBOARD_CONFIG as any).driver?.quickActions || [];

    const getStatValue = (label: string, defaultValue: string = '0') => {
        return dashboardData?.stats?.find(s => s.label === label)?.value || defaultValue;
    };

    const stats = [
        { title: 'Route Stops', value: getStatValue('Route Stops', '12'), icon: 'location-outline' },
        { title: 'Students', value: getStatValue('Students', '38'), icon: 'people-outline' },
    ];

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primaryForeground}
                    />
                }
            >
                {/* Banner Header */}
                <View style={[styles.banner, { backgroundColor: theme.colors.primary }]}>
                    <SafeAreaView edges={['top']}>
                        <View style={styles.headerContent}>
                            <View>
                                <ThemedText style={styles.userName} type="title" color="primaryForeground">
                                    Hi, {user?.name?.split(' ')[0] || 'Driver'} 👋
                                </ThemedText>
                                <ThemedText style={styles.subtitle} color="primaryForeground">
                                    Driver Dashboard
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
                                        <ThemedText style={styles.bannerStatValue} type="title" color="primaryForeground">
                                            {stat.value}
                                        </ThemedText>
                                        <ThemedText style={styles.bannerStatTitle} color="primaryForeground">
                                            {stat.title}
                                        </ThemedText>
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

                    {/* Today's Trip */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">Today's Trip</ThemedText>
                    </View>
                    <ThemedCard style={styles.tripCard} padding={16}>
                        <View style={styles.tripRow}>
                            <View style={[styles.tripIcon, { backgroundColor: `${theme.colors.primary}18` }]}>
                                <Ionicons name="bus" size={22} color={theme.colors.primary} />
                            </View>
                            <View style={styles.tripInfo}>
                                <ThemedText type="defaultSemiBold" style={styles.tripTitle}>
                                    Morning Route
                                </ThemedText>
                                <ThemedText lightColor="#666" darkColor="#999" style={styles.tripSub}>
                                    Pickup: 7:00 AM  •  Drop: 8:30 AM
                                </ThemedText>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: '#dcfce7' }]}>
                                <ThemedText style={[styles.statusText, { color: '#166534' }]}>On Time</ThemedText>
                            </View>
                        </View>
                    </ThemedCard>

                    {/* Recent Alerts */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">Alerts</ThemedText>
                    </View>
                    <ThemedCard style={styles.updatesCard} padding={0}>
                        {[
                            { icon: 'notifications', color: '#f59e0b', bg: '#f59e0b15', title: 'Route Change', sub: 'Stop #5 relocated — check map' },
                            { icon: 'alert-circle', color: '#ef4444', bg: '#ef444415', title: 'Traffic Warning', sub: 'Heavy traffic on Main St' },
                        ].map((item, index) => (
                            <View key={index} style={[
                                styles.updateItem,
                                index === 0 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                            ]}>
                                <View style={[styles.updateIcon, { backgroundColor: item.bg }]}>
                                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                                </View>
                                <View style={styles.updateContent}>
                                    <ThemedText style={styles.updateTitle} type="defaultSemiBold">{item.title}</ThemedText>
                                    <ThemedText style={styles.updateSubtitle} lightColor="#666" darkColor="#999">{item.sub}</ThemedText>
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
    container: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { flexGrow: 1 },
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
    userName: { fontSize: 26, fontWeight: '700' },
    subtitle: { fontSize: 15, marginTop: 4 },
    logoutIcon: { padding: 8 },
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
    bannerStatValue: { fontSize: 20, fontWeight: '700' },
    bannerStatTitle: { fontSize: 11 },
    mainContent: {
        flex: 1,
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
    sectionTitle: { fontSize: 18, fontWeight: '700' },
    tripCard: { borderRadius: 20, marginBottom: 32 },
    tripRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    tripIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tripInfo: { flex: 1 },
    tripTitle: { fontSize: 15, marginBottom: 2 },
    tripSub: { fontSize: 13 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 12, fontWeight: '600' },
    updatesCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 40 },
    updateItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    updateIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    updateContent: { flex: 1 },
    updateTitle: { fontSize: 15, marginBottom: 2 },
    updateSubtitle: { fontSize: 13 },
});
