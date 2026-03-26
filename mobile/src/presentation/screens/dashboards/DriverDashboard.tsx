import { DASHBOARD_CONFIG } from '@/core/config/dashboard';
import { useTheme } from '@/core/theme/ThemeContext';
import { QuickActionGrid } from '@/presentation/components/dashboard/QuickActionGrid';
import { ThemedButton } from '@/presentation/components/ThemedButton';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedTextInput } from '@/presentation/components/ThemedTextInput';
import { ThemedView } from '@/presentation/components/ThemedView';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useDashboard } from '@/presentation/hooks/useDashboard';
import { useIncidents } from '@/presentation/hooks/useIncidents';
import { IncidentSeverity, IncidentType } from '@/domain/entities/incident';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Options for the incident form pickers
const INCIDENT_TYPES: { label: string; value: IncidentType; icon: string }[] = [
    { label: 'Breakdown', value: 'breakdown', icon: 'build' },
    { label: 'Accident', value: 'accident', icon: 'car' },
    { label: 'Delay', value: 'delay', icon: 'time' },
];

const SEVERITY_LEVELS: { label: string; value: IncidentSeverity; color: string }[] = [
    { label: 'Low', value: 'low', color: '#22c55e' },
    { label: 'Medium', value: 'medium', color: '#f59e0b' },
    { label: 'High', value: 'high', color: '#f97316' },
    { label: 'Critical', value: 'critical', color: '#ef4444' },
];

export default function DriverDashboard() {
    const { logout, user } = useAuth();
    const { data: dashboardData, loading, refreshing, onRefresh } = useDashboard();
    const {
        incidents,
        submitting,
        createIncident,
        refresh: refreshIncidents,
    } = useIncidents();
    const { theme, isDark } = useTheme();

    // Form state
    const [selectedType, setSelectedType] = useState<IncidentType>('breakdown');
    const [selectedSeverity, setSelectedSeverity] = useState<IncidentSeverity>('medium');
    const [description, setDescription] = useState('');
    const [showForm, setShowForm] = useState(false);

    const quickActions = DASHBOARD_CONFIG.driver.quickActions;

    const getStatValue = (label: string, defaultValue: string = '0') => {
        return dashboardData?.stats?.find(s => s.label === label)?.value || defaultValue;
    };

    const stats = [
        { title: 'Total Incidents', value: getStatValue('Total Incidents'), icon: 'warning', color: '#fff' },
        { title: 'Vehicle Status', value: getStatValue('Vehicle Status', 'Active'), icon: 'car', color: '#fff' },
    ];

    const handleSubmitIncident = async () => {
        if (!description.trim()) {
            Alert.alert('Validation Error', 'Please enter a description for the incident.');
            return;
        }

        try {
            await createIncident(selectedType, selectedSeverity, description);
            Alert.alert('Success', 'Incident reported successfully!');
            // Reset form
            setDescription('');
            setSelectedType('breakdown');
            setSelectedSeverity('medium');
            setShowForm(false);
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to report incident. Please try again.');
        }
    };

    const handleRefresh = async () => {
        await onRefresh();
        await refreshIncidents();
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'low': return '#22c55e';
            case 'medium': return '#f59e0b';
            case 'high': return '#f97316';
            case 'critical': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'breakdown': return 'build';
            case 'accident': return 'car';
            case 'delay': return 'time';
            default: return 'alert-circle';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return '#3b82f6';
            case 'acknowledged': return '#f59e0b';
            case 'resolved': return '#22c55e';
            default: return '#6b7280';
        }
    };

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle={isDark ? "light-content" : "light-content"} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />}
            >
                {/* Blue Banner Header */}
                <View style={[styles.banner, { backgroundColor: theme.colors.primary }]}>
                    <SafeAreaView edges={['top']}>
                        <View style={styles.headerContent}>
                            <View>
                                <ThemedText style={styles.userName} type="title" color="primaryForeground">
                                    {user?.name || 'Driver'}
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

                    {/* Report Incident Section */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">Report Incident</ThemedText>
                        <TouchableOpacity
                            onPress={() => setShowForm(!showForm)}
                            style={[styles.toggleButton, { backgroundColor: theme.colors.primary }]}
                        >
                            <Ionicons name={showForm ? 'chevron-up' : 'add'} size={20} color={theme.colors.primaryForeground} />
                        </TouchableOpacity>
                    </View>

                    {showForm && (
                        <ThemedCard style={styles.formCard}>
                            {/* Incident Type Picker */}
                            <ThemedText style={styles.formLabel}>Incident Type</ThemedText>
                            <View style={styles.optionRow}>
                                {INCIDENT_TYPES.map((type) => (
                                    <TouchableOpacity
                                        key={type.value}
                                        style={[
                                            styles.optionChip,
                                            {
                                                backgroundColor: selectedType === type.value
                                                    ? theme.colors.primary
                                                    : theme.colors.secondary,
                                                borderColor: selectedType === type.value
                                                    ? theme.colors.primary
                                                    : theme.colors.border,
                                            },
                                        ]}
                                        onPress={() => setSelectedType(type.value)}
                                    >
                                        <Ionicons
                                            name={type.icon as any}
                                            size={16}
                                            color={selectedType === type.value ? theme.colors.primaryForeground : theme.colors.foreground}
                                        />
                                        <ThemedText
                                            style={[
                                                styles.optionChipText,
                                                {
                                                    color: selectedType === type.value
                                                        ? theme.colors.primaryForeground
                                                        : theme.colors.foreground,
                                                },
                                            ]}
                                        >
                                            {type.label}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Severity Picker */}
                            <ThemedText style={styles.formLabel}>Severity</ThemedText>
                            <View style={styles.optionRow}>
                                {SEVERITY_LEVELS.map((level) => (
                                    <TouchableOpacity
                                        key={level.value}
                                        style={[
                                            styles.severityChip,
                                            {
                                                backgroundColor: selectedSeverity === level.value
                                                    ? level.color
                                                    : level.color + '15',
                                                borderColor: level.color,
                                                borderWidth: selectedSeverity === level.value ? 0 : 1,
                                            },
                                        ]}
                                        onPress={() => setSelectedSeverity(level.value)}
                                    >
                                        <ThemedText
                                            style={[
                                                styles.severityChipText,
                                                {
                                                    color: selectedSeverity === level.value
                                                        ? '#fff'
                                                        : level.color,
                                                },
                                            ]}
                                        >
                                            {level.label}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Description Input */}
                            <ThemedTextInput
                                label="Description"
                                placeholder="Describe the incident..."
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                style={styles.descriptionInput}
                            />

                            {/* Submit Button */}
                            <ThemedButton
                                title={submitting ? 'Submitting...' : 'Submit Report'}
                                onPress={handleSubmitIncident}
                                disabled={submitting || !description.trim()}
                            />
                        </ThemedCard>
                    )}

                    {/* Incident History */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">Incident History</ThemedText>
                        {incidents.length > 0 && (
                            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                                <ThemedText style={styles.badgeText} color="primaryForeground">
                                    {incidents.length}
                                </ThemedText>
                            </View>
                        )}
                    </View>

                    {incidents.length === 0 ? (
                        <ThemedCard style={styles.emptyCard}>
                            <View style={styles.emptyContent}>
                                <Ionicons name="checkmark-circle-outline" size={48} color={theme.colors.mutedForeground} />
                                <ThemedText style={styles.emptyText} lightColor="#666" darkColor="#999">
                                    No incidents reported yet
                                </ThemedText>
                            </View>
                        </ThemedCard>
                    ) : (
                        <ThemedCard style={styles.historyCard} padding={0}>
                            {incidents.map((incident, index) => (
                                <View
                                    key={incident.id}
                                    style={[
                                        styles.incidentItem,
                                        index !== incidents.length - 1 && {
                                            borderBottomWidth: 1,
                                            borderBottomColor: theme.colors.border,
                                        },
                                    ]}
                                >
                                    <View style={[styles.incidentIcon, { backgroundColor: getSeverityColor(incident.severity) + '15' }]}>
                                        <Ionicons
                                            name={getTypeIcon(incident.type) as any}
                                            size={20}
                                            color={getSeverityColor(incident.severity)}
                                        />
                                    </View>
                                    <View style={styles.incidentContent}>
                                        <ThemedText style={styles.incidentType} type="defaultSemiBold">
                                            {incident.type.charAt(0).toUpperCase() + incident.type.slice(1)}
                                        </ThemedText>
                                        <ThemedText style={styles.incidentDescription} lightColor="#666" darkColor="#999" numberOfLines={2}>
                                            {incident.description}
                                        </ThemedText>
                                        <View style={styles.incidentMeta}>
                                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) + '20' }]}>
                                                <ThemedText style={[styles.statusText, { color: getStatusColor(incident.status) }]}>
                                                    {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                                                </ThemedText>
                                            </View>
                                            <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(incident.severity) + '20' }]}>
                                                <ThemedText style={[styles.severityText, { color: getSeverityColor(incident.severity) }]}>
                                                    {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                                                </ThemedText>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </ThemedCard>
                    )}

                    {/* Bottom spacing */}
                    <View style={{ height: 40 }} />
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
        flex: 1,
    },
    toggleButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
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
    formCard: {
        borderRadius: 24,
        marginBottom: 32,
        padding: 20,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
        marginTop: 4,
    },
    optionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    optionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
        borderWidth: 1,
    },
    optionChipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    severityChip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
    },
    severityChipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    descriptionInput: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    historyCard: {
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 16,
    },
    emptyCard: {
        borderRadius: 24,
        marginBottom: 16,
    },
    emptyContent: {
        alignItems: 'center',
        paddingVertical: 32,
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
    },
    incidentItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
    },
    incidentIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    incidentContent: {
        flex: 1,
    },
    incidentType: {
        fontSize: 15,
        marginBottom: 2,
    },
    incidentDescription: {
        fontSize: 13,
        marginBottom: 8,
    },
    incidentMeta: {
        flexDirection: 'row',
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    severityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    severityText: {
        fontSize: 11,
        fontWeight: '600',
    },
});
