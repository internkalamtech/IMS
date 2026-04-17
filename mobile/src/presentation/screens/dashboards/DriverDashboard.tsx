<<<<<<< HEAD
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { DriverRepositoryImpl } from '@/data/repositories/driver-repository-impl';
import { ComplianceDocument } from '@/domain/entities/compliance-document';
import { MaintenanceTask } from '@/domain/entities/maintenance-task';
import { GetDriverDocumentsUseCase } from '@/domain/usecases/get-driver-documents-usecase';
import { GetDriverMaintenanceUseCase } from '@/domain/usecases/get-driver-maintenance-usecase';
import { useTheme } from '@/core/theme/ThemeContext';
=======
import { DASHBOARD_CONFIG, QuickAction } from '@/core/config/dashboard';
import { useTheme } from '@/core/theme/ThemeContext';
import { QuickActionGrid } from '@/presentation/components/dashboard/QuickActionGrid';
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { useAuth } from '@/presentation/hooks/useAuth';
<<<<<<< HEAD

const driverRepository = new DriverRepositoryImpl();
const getDriverDocumentsUseCase = new GetDriverDocumentsUseCase(
    driverRepository
);
const getDriverMaintenanceUseCase = new GetDriverMaintenanceUseCase(
    driverRepository
);

function getDaysLeft(expiryDate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    return Math.ceil(
        (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
}

function getCountdownLabel(daysLeft: number): string {
    if (daysLeft < 0) {
        return `${Math.abs(daysLeft)} day${
            Math.abs(daysLeft) === 1 ? '' : 's'
        } overdue`;
    }

    if (daysLeft === 0) {
        return 'Expires today';
    }

    return `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`;
}

function getDocumentAccentColor(expiryDate: string): string {
    const daysLeft = getDaysLeft(expiryDate);

    if (daysLeft < 0) {
        return '#ef4444';
    }

    if (daysLeft <= 7) {
        return '#f59e0b';
    }

    return '#22c55e';
}

function getMaintenanceAccentColor(status: MaintenanceTask['status']): string {
    switch (status) {
        case 'Completed':
            return '#22c55e';
        case 'In Progress':
            return '#3b82f6';
        case 'Scheduled':
            return '#f59e0b';
    }
}
=======
import { useIncidents } from '@/presentation/hooks/useIncidents';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { BackHandler, RefreshControl, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IncidentListScreen from '../IncidentListScreen';
import ReportIncidentScreen from '../ReportIncidentScreen';

type ViewState = 'dashboard' | 'report_incident' | 'incident_list';
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89

export default function DriverDashboard() {
    const { logout, user } = useAuth();
    const { theme } = useTheme();
<<<<<<< HEAD
    const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
    const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        const [driverDocuments, maintenanceTasks] = await Promise.all([
            getDriverDocumentsUseCase.execute(),
            getDriverMaintenanceUseCase.execute(),
        ]);

        setDocuments(driverDocuments);
        setTasks(
            [...maintenanceTasks].sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
            )
        );
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await loadData();
        } finally {
            setRefreshing(false);
        }
    };

    const alertCount = documents.filter(
        (document) => getDaysLeft(document.expiryDate) <= 7
    ).length;
    const activeJobs = tasks.filter(
        (task) => task.status === 'In Progress'
    ).length;
=======
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
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
<<<<<<< HEAD
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primaryForeground}
                    />
                }
            >
                <View
                    style={[
                        styles.banner,
                        { backgroundColor: theme.colors.primary },
                    ]}
                >
                    <SafeAreaView edges={['top']}>
                        <View style={styles.headerContent}>
                            <View>
                                <ThemedText
                                    style={styles.userName}
                                    type="title"
                                    color="primaryForeground"
                                >
                                    {user?.name || 'Driver User'}
                                </ThemedText>
                                <ThemedText
                                    style={styles.subtitle}
                                    color="primaryForeground"
                                >
                                    Vehicle and license overview for today
                                </ThemedText>
                            </View>
                            <TouchableOpacity
                                onPress={logout}
                                style={styles.logoutIcon}
                            >
                                <Ionicons
                                    name="log-out-outline"
                                    size={24}
                                    color={theme.colors.primaryForeground}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bannerStats}>
                            <View
                                style={[
                                    styles.bannerStatCard,
                                    { backgroundColor: 'rgba(255,255,255,0.12)' },
                                ]}
                            >
                                <View style={styles.statIconContainer}>
                                    <Ionicons
                                        name="shield-checkmark-outline"
                                        size={20}
                                        color={theme.colors.primaryForeground}
                                    />
                                </View>
                                <View>
                                    <ThemedText
                                        style={styles.bannerStatValue}
                                        type="title"
                                        color="primaryForeground"
                                    >
                                        {alertCount}
                                    </ThemedText>
                                    <ThemedText
                                        style={styles.bannerStatTitle}
                                        color="primaryForeground"
                                    >
                                        Alerts
                                    </ThemedText>
                                </View>
                            </View>

                            <View
                                style={[
                                    styles.bannerStatCard,
                                    { backgroundColor: 'rgba(255,255,255,0.12)' },
                                ]}
                            >
                                <View style={styles.statIconContainer}>
                                    <Ionicons
                                        name="build-outline"
                                        size={20}
                                        color={theme.colors.primaryForeground}
                                    />
                                </View>
                                <View>
                                    <ThemedText
                                        style={styles.bannerStatValue}
                                        type="title"
                                        color="primaryForeground"
                                    >
                                        {activeJobs}
                                    </ThemedText>
                                    <ThemedText
                                        style={styles.bannerStatTitle}
                                        color="primaryForeground"
                                    >
                                        Active Jobs
                                    </ThemedText>
=======
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
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
                                </View>
                            </View>
                        </View>
                    </SafeAreaView>
                </View>

<<<<<<< HEAD
                <View
                    style={[
                        styles.mainContent,
                        { backgroundColor: theme.colors.background },
                    ]}
                >
                    <View style={styles.sectionHeader}>
                        <ThemedText
                            style={styles.sectionTitle}
                            type="subtitle"
                        >
                            Driver Tools
                        </ThemedText>
                    </View>

                    <View style={styles.toolButtons}>
                        <TouchableOpacity
                            style={[
                                styles.toolButton,
                                { backgroundColor: theme.colors.primary },
                            ]}
                            onPress={() => router.push('/(tabs)/compliance')}
                        >
                            <ThemedText
                                style={styles.toolButtonText}
                                lightColor="#fff"
                                darkColor="#fff"
                            >
                                Open Compliance
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.toolButton,
                                {
                                    backgroundColor: theme.colors.card,
                                    borderColor: theme.colors.border,
                                },
                            ]}
                            onPress={() => router.push('/(tabs)/maintenance')}
                        >
                            <ThemedText style={styles.secondaryToolButtonText}>
                                Open Maintenance
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sectionHeader}>
                        <ThemedText
                            style={styles.sectionTitle}
                            type="subtitle"
                        >
                            Document Tracker
                        </ThemedText>
                    </View>

                    <ThemedCard style={styles.previewCard} padding={0}>
                        {documents.map((document, index) => (
                            <View
                                key={`${document.title}-${document.expiryDate}`}
                                style={[
                                    styles.listItem,
                                    index !== documents.length - 1 && {
                                        borderBottomWidth: 1,
                                        borderBottomColor: theme.colors.border,
                                    },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.accentBar,
                                        {
                                            backgroundColor: getDocumentAccentColor(
                                                document.expiryDate
                                            ),
                                        },
                                    ]}
                                />
                                <View style={styles.itemContent}>
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={styles.itemTitle}
                                    >
                                        {document.title}
                                    </ThemedText>
                                    <ThemedText style={styles.itemMeta}>
                                        Expires on {document.expiryDate}
                                    </ThemedText>
                                    <ThemedText
                                        style={[
                                            styles.itemMeta,
                                            { color: '#ef4444' },
                                        ]}
                                    >
                                        {getCountdownLabel(
                                            getDaysLeft(document.expiryDate)
                                        )}
                                    </ThemedText>
                                </View>
                                <View style={styles.expiredBadge}>
                                    <ThemedText
                                        style={styles.expiredBadgeText}
                                        lightColor="#d9465f"
                                        darkColor="#d9465f"
                                    >
                                        {getDaysLeft(document.expiryDate) < 0
                                            ? 'Expired'
                                            : 'Valid'}
=======
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
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
                                    </ThemedText>
                                </View>
                            </View>
                        ))}
<<<<<<< HEAD
                    </ThemedCard>

                    <View style={styles.sectionHeader}>
                        <ThemedText
                            style={styles.sectionTitle}
                            type="subtitle"
                        >
                            Maintenance Timeline
                        </ThemedText>
                    </View>

                    <ThemedCard style={styles.previewCard} padding={0}>
                        {tasks.map((task, index) => (
                            <View
                                key={`${task.title}-${task.date}`}
                                style={[
                                    styles.listItem,
                                    index !== tasks.length - 1 && {
                                        borderBottomWidth: 1,
                                        borderBottomColor: theme.colors.border,
                                    },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.accentBar,
                                        {
                                            backgroundColor:
                                                getMaintenanceAccentColor(
                                                    task.status
                                                ),
                                        },
                                    ]}
                                />
                                <View style={styles.itemContent}>
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={styles.itemTitle}
                                    >
                                        {task.title}
                                    </ThemedText>
                                    <ThemedText style={styles.itemMeta}>
                                        Scheduled for {task.date}
                                    </ThemedText>
                                </View>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        {
                                            backgroundColor:
                                                getMaintenanceAccentColor(
                                                    task.status
                                                ) + '20',
                                        },
                                    ]}
                                >
                                    <ThemedText
                                        style={[
                                            styles.statusBadgeText,
                                            {
                                                color:
                                                    getMaintenanceAccentColor(
                                                        task.status
                                                    ),
                                            },
                                        ]}
                                    >
                                        {task.status}
                                    </ThemedText>
                                </View>
                            </View>
                        ))}
=======
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
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
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
<<<<<<< HEAD
        paddingBottom: 28,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
=======
        paddingBottom: 30,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
<<<<<<< HEAD
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 20,
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 14,
=======
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
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
        marginTop: 4,
    },
    logoutIcon: {
        padding: 8,
    },
    bannerStats: {
        flexDirection: 'row',
<<<<<<< HEAD
        paddingHorizontal: 16,
=======
        paddingHorizontal: 20,
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
        gap: 12,
    },
    bannerStatCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
<<<<<<< HEAD
        borderRadius: 18,
        gap: 12,
    },
    statIconContainer: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.16)',
=======
        borderRadius: 20,
        gap: 12,
    },
    statIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerStatValue: {
<<<<<<< HEAD
        fontSize: 24,
        fontWeight: '700',
    },
    bannerStatTitle: {
        fontSize: 12,
    },
    mainContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 40,
    },
    sectionHeader: {
        marginBottom: 14,
=======
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
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
<<<<<<< HEAD
    toolButtons: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 18,
    },
    toolButton: {
        flex: 1,
        minHeight: 46,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    toolButtonText: {
        fontSize: 14,
        fontWeight: '700',
    },
    secondaryToolButtonText: {
        fontSize: 14,
        fontWeight: '700',
        opacity: 0.8,
    },
    previewCard: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    accentBar: {
        width: 3,
        alignSelf: 'stretch',
        borderRadius: 2,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        marginBottom: 4,
    },
    itemMeta: {
        fontSize: 13,
        opacity: 0.8,
        marginTop: 2,
    },
    expiredBadge: {
        borderRadius: 999,
        backgroundColor: '#ffe4ea',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    expiredBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    statusBadge: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
=======
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
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
});
