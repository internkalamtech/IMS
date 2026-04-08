import { DASHBOARD_CONFIG, QuickAction } from '@/core/config/dashboard';
import { useTheme } from '@/core/theme/ThemeContext';
import { QuickActionGrid } from '@/presentation/components/dashboard/QuickActionGrid';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useIncidents } from '@/presentation/hooks/useIncidents';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { BackHandler, RefreshControl, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IncidentListScreen from '../IncidentListScreen';
import ReportIncidentScreen from '../ReportIncidentScreen';

type ViewState = 'dashboard' | 'report_incident' | 'incident_list';

export default function DriverDashboard() {
    const { logout, user } = useAuth();
    const { theme } = useTheme();
    const { incidents, loading, refreshing, submitting, submitIncident, onRefresh } = useIncidents();
    const [currentView, setCurrentView] = useState<ViewState>('dashboard');

    useEffect(() => {
        const onBackPress = () => {
            if (currentView !== 'dashboard') {
                setCurrentView('dashboard');
                return true; // Prevent default behavior (exit app)
            }
            return false; // Default behavior
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => subscription.remove();
    }, [currentView]);

    const quickActions = DASHBOARD_CONFIG.driver.quickActions;

    const handleActionPress = (action: QuickAction) => {
        if (action.title === 'Report Incident') {
            setCurrentView('report_incident');
        } else if (action.title === 'My Incidents') {
            setCurrentView('incident_list');
        } else {
            // Other actions could go here
            console.log(`Action not implemented: ${action.title}`);
        }
    };

    const getIncidentColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'breakdown': return '#f59e0b';
            case 'accident': return '#ef4444';
            case 'delay': return '#3b82f6';
            default: return theme.colors.primary;
        }
    };

    if (currentView === 'report_incident') {
        return <ReportIncidentScreen 
            onBack={() => setCurrentView('dashboard')} 
            onSubmit={submitIncident} 
            submitting={submitting} 
        />;
    }

    if (currentView === 'incident_list') {
        return <IncidentListScreen 
            onBack={() => setCurrentView('dashboard')} 
            incidents={incidents}
            loading={loading}
            refreshing={refreshing}
            onRefresh={onRefresh}
        />;
    }

    const todayIncidents = incidents.filter(i => {
        const today = new Date().toISOString().split('T')[0];
        return i.createdAt.startsWith(today);
    });

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
                                    On the road, {user?.name?.split(' ')[0] || 'Driver'} 🚗
                                </ThemedText>
                                <ThemedText style={styles.subtitle} color="primaryForeground">
                                    Your shift at a glance
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
                                    <Ionicons name="warning" size={24} color={theme.colors.primaryForeground} />
                                </View>
                                <View>
                                    <ThemedText style={styles.bannerStatValue} type="title" color="primaryForeground">{todayIncidents.length}</ThemedText>
                                    <ThemedText style={styles.bannerStatTitle} color="primaryForeground">Incidents Today</ThemedText>
                                </View>
                            </View>
                            <View style={[styles.bannerStatCard, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                                <View style={styles.statIconContainer}>
                                    <Ionicons name="map" size={24} color={theme.colors.primaryForeground} />
                                </View>
                                <View>
                                    <ThemedText style={styles.bannerStatValue} type="title" color="primaryForeground">Route 4</ThemedText>
                                    <ThemedText style={styles.bannerStatTitle} color="primaryForeground">Active Route</ThemedText>
                                </View>
                            </View>
                        </View>
                    </SafeAreaView>
                </View>

                {/* Main Content */}
                <View style={[styles.mainContent, { backgroundColor: theme.colors.background }]}>
                    {/* Quick Actions */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">Driver Tools</ThemedText>
                    </View>

                    <QuickActionGrid actions={quickActions} onActionPress={handleActionPress} />

                    {/* Recent Incidents */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">Recent Incidents</ThemedText>
                    </View>
                    <ThemedCard style={styles.updatesCard} padding={0}>
                        {incidents.slice(0, 2).map((item, index) => (
                            <View key={item.id} style={[
                                styles.updateItem,
                                index !== Math.min(incidents.length - 1, 1) && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }
                            ]}>
                                <View style={[styles.classColorBar, { backgroundColor: getIncidentColor(item.type) }]} />
                                <View style={styles.updateContent}>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 2}}>
                                        <ThemedText style={styles.updateTitle} type="defaultSemiBold">{item.type}</ThemedText>
                                        <View style={[styles.severityBadge, {backgroundColor: item.severity === 'High' ? '#ef444420' : item.severity === 'Medium' ? '#f59e0b20' : '#10b98120'}]}>
                                            <ThemedText style={{fontSize: 10, color: item.severity === 'High' ? '#ef4444' : item.severity === 'Medium' ? '#f59e0b' : '#10b981', fontWeight: 'bold'}}>{item.severity}</ThemedText>
                                        </View>
                                    </View>
                                    <ThemedText style={styles.updateSubtitle} lightColor="#666" darkColor="#999" numberOfLines={1}>{item.description}</ThemedText>
                                </View>
                                <View style={[styles.timeTag, { backgroundColor: theme.colors.primary + '10' }]}>
                                    <ThemedText style={{ color: theme.colors.primary, fontSize: 12 }} type="defaultSemiBold">
                                        {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </ThemedText>
                                </View>
                            </View>
                        ))}
                        {incidents.length === 0 && (
                            <View style={{padding: 24, alignItems: 'center', justifyContent: 'center'}}>
                                <Ionicons name="checkmark-circle-outline" size={48} color={theme.colors.border} style={{marginBottom: 8}}/>
                                <ThemedText lightColor="#666" darkColor="#999">No recent incidents</ThemedText>
                            </View>
                        )}
                        {incidents.length > 0 && (
                            <TouchableOpacity style={styles.viewAllButton} onPress={() => setCurrentView('incident_list')}>
                                <ThemedText type="link" style={{textAlign: 'center', fontWeight: '600'}}>View All</ThemedText>
                            </TouchableOpacity>
                        )}
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
    },
    updateSubtitle: {
        fontSize: 13,
        paddingRight: 10,
    },
    timeTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    severityBadge: {
        marginLeft: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    viewAllButton: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
    }
});
