import { DriverRepositoryImpl } from '@/data/repositories/driver-repository-impl';
import { MaintenanceTask } from '@/domain/entities/maintenance-task';
import { GetDriverMaintenanceUseCase } from '@/domain/usecases/get-driver-maintenance-usecase';
import { useAuth } from '@/presentation/hooks/useAuth';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedCard } from '../components/ThemedCard';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';

const driverRepository = new DriverRepositoryImpl();
const getDriverMaintenanceUseCase = new GetDriverMaintenanceUseCase(driverRepository);

export default function MaintenanceScreen() {
    const { authReady, user } = useAuth();
    const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadTasks = useCallback(async (isRefresh: boolean = false) => {
        if (!authReady || !user) {
            setError('No token available');
            setLoading(false);
            setRefreshing(false);
            return;
        }

        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError(null);

        try {
            const maintenanceTasks = await getDriverMaintenanceUseCase.execute();
            setTasks(maintenanceTasks);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to load maintenance tasks');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [authReady, user]);

    useEffect(() => {
        if (!authReady) {
            return;
        }

        if (!user) {
            setTasks([]);
            setError('No token available');
            setLoading(false);
            setRefreshing(false);
            return;
        }

        void loadTasks();
    }, [authReady, loadTasks, user]);

    const getStatusStyle = (status: MaintenanceTask['status']) => {
        switch (status) {
            case 'Completed':
                return styles.completed;
            case 'In Progress':
                return styles.progress;
            case 'Scheduled':
                return styles.scheduled;
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => loadTasks(true)} />
                }
            >
                <ThemedText type="title" style={styles.heading}>
                    Vehicle Maintenance
                </ThemedText>
                <ThemedText style={styles.subheading}>
                    View upcoming and past maintenance work for your assigned vehicle.
                </ThemedText>

                {loading && (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" />
                    </View>
                )}

                {!loading && error && (
                    <ThemedCard style={styles.messageCard}>
                        <ThemedText style={styles.errorText}>{error}</ThemedText>
                        <Pressable onPress={() => loadTasks()} style={styles.retryButton}>
                            <ThemedText type="link">Retry</ThemedText>
                        </Pressable>
                    </ThemedCard>
                )}

                {!loading && !error && tasks.length === 0 && (
                    <ThemedCard style={styles.messageCard}>
                        <ThemedText>No maintenance tasks found for your assigned vehicle.</ThemedText>
                    </ThemedCard>
                )}

                {!loading && !error && tasks.map((task) => (
                    <ThemedCard key={`${task.title}-${task.date}`} style={styles.card}>
                        <View style={styles.headerRow}>
                            <ThemedText type="defaultSemiBold" style={styles.title}>
                                {task.title}
                            </ThemedText>
                            <View style={[styles.badge, getStatusStyle(task.status)]}>
                                <ThemedText style={styles.badgeText} lightColor="#fff" darkColor="#fff">
                                    {task.status}
                                </ThemedText>
                            </View>
                        </View>

                        <ThemedText style={styles.metaText}>Date: {task.date}</ThemedText>
                    </ThemedCard>
                ))}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    centered: {
        paddingVertical: 32,
        alignItems: 'center',
    },
    heading: {
        marginBottom: 8,
    },
    subheading: {
        marginBottom: 16,
        opacity: 0.7,
    },
    card: {
        marginBottom: 12,
    },
    messageCard: {
        marginTop: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    title: {
        flex: 1,
    },
    metaText: {
        opacity: 0.8,
        marginTop: 4,
    },
    errorText: {
        marginBottom: 8,
    },
    retryButton: {
        alignSelf: 'flex-start',
    },
    badge: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    scheduled: {
        backgroundColor: '#f59e0b',
    },
    progress: {
        backgroundColor: '#3b82f6',
    },
    completed: {
        backgroundColor: '#22c55e',
    },
});
