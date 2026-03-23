import { DASHBOARD_CONFIG } from '@/core/config/dashboard';
import { useTheme } from '@/core/theme/ThemeContext';
import { QuickActionGrid } from '@/presentation/components/dashboard/QuickActionGrid';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useDashboard } from '@/presentation/hooks/useDashboard';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/core/api-client';

const { width } = Dimensions.get('window');

export default function TransportDashboard() {
    const { logout, user } = useAuth();
    const { data: dashboardData, loading, refreshing, onRefresh } = useDashboard();
    const { theme, isDark } = useTheme();

    const quickActions = DASHBOARD_CONFIG.transport?.quickActions || [];

    const getStatValue = (label: string, defaultValue: string = '0') => {
        return dashboardData?.stats?.find((s) => s.label === label)?.value || defaultValue;
    };

    const stats = [
        { title: 'Total Routes', value: getStatValue('Total Routes'), icon: 'location-outline', color: '#fff' },
        { title: 'Total Buses', value: getStatValue('Total Buses'), icon: 'bus-outline', color: '#fff' },
        { title: 'Active Trips', value: getStatValue('Active Trips'), icon: 'pulse-outline', color: '#FFD700' },
        { title: 'Total Students', value: getStatValue('Total Students', '245'), icon: 'people-outline', color: '#fff' },
    ];

    // Transport-specific state
    const [routes, setRoutes] = useState([]);
    const [complianceStatus, setComplianceStatus] = useState(null);
    const [transportAlerts, setTransportAlerts] = useState([]);
    const [expiringDocuments, setExpiringDocuments] = useState([]);
    const [transportLoading, setTransportLoading] = useState(true);

    // Fetch transport data
    const fetchTransportData = async () => {
        try {
            const [routesRes, complianceRes, alertsRes, documentsRes] = await Promise.all([
                api.get('/transport/routes'),
                api.get('/transport/compliance/status'),
                api.get('/transport/alerts?limit=4'),
                api.get('/transport/documents/expiring?days=30')
            ]);

            setRoutes(routesRes.data.routes || []);
            setComplianceStatus(complianceRes.data);
            setTransportAlerts(alertsRes.data.alerts || []);
            setExpiringDocuments(documentsRes.data.documents || []);
        } catch (error) {
            console.error('Failed to fetch transport data:', error);
            // Keep existing fallback data
        } finally {
            setTransportLoading(false);
        }
    };

    useEffect(() => {
        fetchTransportData();
    }, []);

    const alerts = [
        { id: '1', bus: 'BUS-007', time: '15 min ago', message: 'Over-speeding detected - 68 km/h in 50 km/h zone', type: 'danger', icon: 'flash' },
        { id: '2', bus: 'BUS-002', time: '25 min ago', message: 'Route B delayed by 10 minutes due to traffic', type: 'warning', icon: 'time' },
        { id: '3', bus: 'BUS-012', time: '1 hour ago', message: 'Insurance expires in 7 days', type: 'maintenance', icon: 'construct' },
        { id: '4', bus: 'BUS-005', time: '2 hours ago', message: 'Student misbehavior reported', type: 'alert', icon: 'warning' },
    ];

    const getAlertColors = (type: string) => {
        switch (type) {
            case 'danger': return { bg: '#fee2e2', border: '#fca5a5', text: '#ef4444', icon: '#ef4444' }; // Red
            case 'warning': return { bg: '#ffedd5', border: '#fdba74', text: '#f97316', icon: '#4b5563' }; // Orange
            case 'maintenance': return { bg: '#ffedd5', border: '#fdba74', text: '#d97706', icon: '#9ca3af' }; // Soft Orange/Gray icon
            case 'alert': return { bg: '#fef9c3', border: '#fde047', text: '#ca8a04', icon: '#ca8a04' }; // Yellow
            default: return { bg: theme.colors.card, border: theme.colors.border, text: theme.colors.text, icon: theme.colors.text };
        }
    };

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'light-content'} />
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
                                    {user?.name || 'Transport Manager'}
                                </ThemedText>
                                <ThemedText style={styles.subtitle} color="primaryForeground">
                                    Transport Manager
                                </ThemedText>
                            </View>
                            <View style={styles.headerIcons}>
                                <TouchableOpacity onPress={logout} style={styles.logoutIcon}>
                                    <Ionicons name="log-out-outline" size={24} color={theme.colors.primaryForeground} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Banner Stats */}
                        <View style={styles.bannerStats}>
                            {stats.map((stat, index) => (
                                <View key={index} style={[styles.bannerStatCard, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                                    <View style={styles.statIconContainer}>
                                        <Ionicons name={stat.icon as any} size={20} color={theme.colors.primaryForeground} />
                                    </View>
                                    <View style={styles.statTextContainer}>
                                        <ThemedText style={[styles.bannerStatValue, index === 2 && { color: stat.color }]} type="title">
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
                        <ThemedText style={styles.sectionTitle} type="subtitle">
                            Quick Actions
                        </ThemedText>
                    </View>

                    <QuickActionGrid actions={quickActions} />

                    {/* Route Status Overview */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">
                            Route Status
                        </ThemedText>
                    </View>

                    <View style={styles.routeStatusContainer}>
                        {routes.slice(0, 2).map((route) => (
                            <ThemedCard key={route.id} style={styles.routeCard} padding={16}>
                                <View style={styles.routeHeader}>
                                    <Ionicons name="navigate" size={20} color={theme.colors.primary} />
                                    <ThemedText style={styles.routeTitle} type="defaultSemiBold">{route.name}</ThemedText>
                                    <View style={[styles.statusBadge, {
                                        backgroundColor: route.status === 'on_time' ? '#dcfce7' : '#fef3c7'
                                    }]}>
                                        <ThemedText style={[styles.statusText, {
                                            color: route.status === 'on_time' ? '#166534' : '#92400e'
                                        }]}>
                                            {route.status === 'on_time' ? 'On Time' : 'Delayed'}
                                        </ThemedText>
                                    </View>
                                </View>
                                <View style={styles.routeDetails}>
                                    <ThemedText style={styles.routeInfo}>
                                        {route.total_stops} stops • {route.total_students} students • {route.assigned_bus}
                                    </ThemedText>
                                    <ThemedText style={styles.routeTime} lightColor="#6b7280" darkColor="#9ca3af">
                                        {route.next_stop ? `Next: ${route.next_stop} - ${route.next_time}` :
                                         route.status === 'delayed' ? `Delayed by ${route.delay_minutes} min` : 'Completed'}
                                    </ThemedText>
                                </View>
                            </ThemedCard>
                        ))}
                    </View>

                    {/* Compliance Overview */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">
                            Compliance Overview
                        </ThemedText>
                    </View>

                    <View style={styles.complianceContainer}>
                        <View style={styles.complianceItem}>
                            <View style={[styles.complianceIcon, { backgroundColor: '#dcfce7' }]}>
                                <Ionicons name="checkmark-circle" size={20} color="#166534" />
                            </View>
                            <View style={styles.complianceText}>
                                <ThemedText style={styles.complianceTitle} type="defaultSemiBold">Valid Documents</ThemedText>
                                <ThemedText style={styles.complianceCount}>{complianceStatus?.valid_documents || 24}</ThemedText>
                            </View>
                        </View>

                        <View style={styles.complianceItem}>
                            <View style={[styles.complianceIcon, { backgroundColor: '#fef3c7' }]}>
                                <Ionicons name="time" size={20} color="#92400e" />
                            </View>
                            <View style={styles.complianceText}>
                                <ThemedText style={styles.complianceTitle} type="defaultSemiBold">Expiring Soon</ThemedText>
                                <ThemedText style={styles.complianceCount}>{complianceStatus?.expiring_soon || 5}</ThemedText>
                            </View>
                        </View>

                        <View style={styles.complianceItem}>
                            <View style={[styles.complianceIcon, { backgroundColor: '#fee2e2' }]}>
                                <Ionicons name="close-circle" size={20} color="#dc2626" />
                            </View>
                            <View style={styles.complianceText}>
                                <ThemedText style={styles.complianceTitle} type="defaultSemiBold">Expired</ThemedText>
                                <ThemedText style={styles.complianceCount}>{complianceStatus?.expired || 2}</ThemedText>
                            </View>
                        </View>
                    </View>

                    {/* Recent Alerts */}
                    <View style={styles.sectionHeaderAlerts}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">
                            Recent Alerts
                        </ThemedText>
                        <TouchableOpacity>
                            <ThemedText style={styles.viewAllLink} type="link">
                                View All
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.alertsContainer}>
                        {transportAlerts.map((alert) => {
                            const colors = getAlertColors(alert.type);
                            const timeAgo = new Date(alert.timestamp).toLocaleString();
                            return (
                                <View
                                    key={alert.id}
                                    style={[
                                        styles.alertCard,
                                        { backgroundColor: colors.bg, borderColor: colors.border },
                                    ]}
                                >
                                    <Ionicons name={alert.icon || 'warning'} size={20} color={colors.icon} style={styles.alertIcon} />
                                    <View style={styles.alertContent}>
                                        <View style={styles.alertHeader}>
                                            <ThemedText style={[styles.alertBusTitle, { color: colors.text }]}>{alert.bus_id}</ThemedText>
                                            <ThemedText style={styles.alertTime} lightColor="#6b7280" darkColor="#9ca3af">
                                                {timeAgo}
                                            </ThemedText>
                                        </View>
                                        <ThemedText style={[styles.alertMessage, { color: colors.text }]}>
                                            {alert.message}
                                        </ThemedText>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    {/* Documents Expiring Soon */}
                    <ThemedCard style={styles.docsCard} padding={20}>
                        <View style={styles.docsHeaderRow}>
                            <ThemedText style={styles.sectionTitle} type="subtitle">
                                Documents Expiring Soon
                            </ThemedText>
                            <View style={styles.docsBadge}>
                                <ThemedText style={styles.docsBadgeText}>5</ThemedText>
                            </View>
                        </View>

                        <View style={styles.docItem}>
                            {expiringDocuments.length > 0 ? (
                                <>
                                    <View>
                                        <ThemedText style={styles.docBusTitle} type="defaultSemiBold">{expiringDocuments[0].bus_id}</ThemedText>
                                        <ThemedText style={styles.docType} lightColor="#6b7280" darkColor="#9ca3af">{expiringDocuments[0].type}</ThemedText>
                                    </View>
                                    <View style={styles.docExpiryContainer}>
                                        <ThemedText style={styles.docDaysLeft}>{expiringDocuments[0].days_left} days</ThemedText>
                                        <ThemedText style={styles.docDate} lightColor="#6b7280" darkColor="#9ca3af">
                                            {new Date(expiringDocuments[0].expiry_date).toLocaleDateString()}
                                        </ThemedText>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View>
                                        <ThemedText style={styles.docBusTitle} type="defaultSemiBold">BUS-012</ThemedText>
                                        <ThemedText style={styles.docType} lightColor="#6b7280" darkColor="#9ca3af">Insurance</ThemedText>
                                    </View>
                                    <View style={styles.docExpiryContainer}>
                                        <ThemedText style={styles.docDaysLeft}>7 days</ThemedText>
                                        <ThemedText style={styles.docDate} lightColor="#6b7280" darkColor="#9ca3af">Jan 26, 2026</ThemedText>
                                    </View>
                                </>
                            )}
                        </View>
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
    headerIcons: {
        flexDirection: 'row',
    },
    logoutIcon: {
        padding: 8,
    },
    bannerStats: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 8,
        justifyContent: 'space-between',
    },
    bannerStatCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderRadius: 20,
        height: 120,
        justifyContent: 'space-between',
    },
    statIconContainer: {
        marginBottom: 8,
    },
    statTextContainer: {
        alignItems: 'center',
    },
    bannerStatValue: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    bannerStatTitle: {
        fontSize: 11,
        textAlign: 'center',
        opacity: 0.9,
    },
    mainContent: {
        flex: 1,
        marginTop: 0,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 20, // Slightly tighter padding to match design
        paddingTop: 32,
        paddingBottom: 40,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    sectionHeaderAlerts: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 4,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    viewAllLink: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2563eb', // Link blue
    },
    alertsContainer: {
        gap: 12,
        marginBottom: 32,
    },
    alertCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    alertIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    alertContent: {
        flex: 1,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    alertBusTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginRight: 8,
    },
    alertTime: {
        fontSize: 12,
    },
    alertMessage: {
        fontSize: 14,
        lineHeight: 20,
    },
    docsCard: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb', // soft gray border
        shadowColor: 'transparent', // remove default shadow to look flatter
        elevation: 0,
    },
    docsHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    docsBadge: {
        backgroundColor: '#ffedd5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    docsBadgeText: {
        color: '#d97706',
        fontSize: 12,
        fontWeight: '700',
    },
    docItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    docBusTitle: {
        fontSize: 15,
        marginBottom: 4,
    },
    docType: {
        fontSize: 13,
    },
    docExpiryContainer: {
        alignItems: 'flex-end',
    },
    docDaysLeft: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ef4444', // Red for expiry urgency
        marginBottom: 4,
    },
    docDate: {
        fontSize: 12,
    },
    routeStatusContainer: {
        gap: 12,
        marginBottom: 32,
    },
    routeCard: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: 'transparent',
        elevation: 0,
    },
    routeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    routeTitle: {
        fontSize: 16,
        marginLeft: 8,
        marginRight: 8,
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    routeDetails: {
        marginLeft: 28,
    },
    routeInfo: {
        fontSize: 14,
        marginBottom: 4,
        lightColor: '#6b7280',
        darkColor: '#9ca3af',
    },
    routeTime: {
        fontSize: 12,
    },
    complianceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        gap: 12,
    },
    complianceItem: {
        flex: 1,
        alignItems: 'center',
    },
    complianceIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    complianceText: {
        alignItems: 'center',
    },
    complianceTitle: {
        fontSize: 12,
        marginBottom: 4,
        textAlign: 'center',
        lightColor: '#6b7280',
        darkColor: '#9ca3af',
    },
    complianceCount: {
        fontSize: 20,
        fontWeight: '700',
        lightColor: '#111827',
        darkColor: '#f9fafb',
    },
});
