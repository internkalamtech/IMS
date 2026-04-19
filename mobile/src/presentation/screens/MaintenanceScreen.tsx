import { getApiBaseUrl } from '@/core/api-config';
import { useAuth } from '@/presentation/hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { ThemedCard } from '../components/ThemedCard';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';

type MaintenanceTaskStatus = 'Scheduled' | 'In Progress' | 'Completed';

type MaintenanceTask = {
    title: string;
    date: string;
    status: MaintenanceTaskStatus;
};

const API_BASE_URL = getApiBaseUrl();
const TOKEN_STORAGE_KEY = 'auth_token';

function getErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        if (typeof detail === 'string' && detail.length > 0) {
            return detail;
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
}

export default function MaintenanceScreen() {
    const { loading, user } = useAuth();
    const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
    const [screenLoading, setScreenLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadTasks = useCallback(
        async (isRefresh: boolean = false) => {
            if (!user) {
                setTasks([]);
                setError('No token available');
                setScreenLoading(false);
                setRefreshing(false);
                return;
            }

            const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
            if (!token) {
                setTasks([]);
                setError('No token available');
                setScreenLoading(false);
                setRefreshing(false);
                return;
            }

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setScreenLoading(true);
            }

            setError(null);

            try {
                const response = await axios.get<MaintenanceTask[]>(
                    `${API_BASE_URL}/driver/maintenance`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setTasks(response.data);
            } catch (fetchError: unknown) {
                setError(
                    getErrorMessage(
                        fetchError,
                        'Failed to load maintenance tasks'
                    )
                );
            } finally {
                setScreenLoading(false);
                setRefreshing(false);
            }
        },
        [user]
    );

    useEffect(() => {
        if (loading) {
            return;
        }

        if (!user) {
            setTasks([]);
            setError('No token available');
            setScreenLoading(false);
            setRefreshing(false);
            return;
        }

        void loadTasks();
    }, [loading, loadTasks, user]);

    const sortedTasks = [...tasks].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const getStatusStyle = (status: MaintenanceTaskStatus) => {
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
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => void loadTasks(true)}
                    />
                }
            >
                <ThemedText type="title" style={styles.heading}>
                    Vehicle Maintenance
                </ThemedText>
                <ThemedText style={styles.subheading}>
                    View upcoming and past maintenance work for your assigned
                    vehicle.
                </ThemedText>

                {screenLoading && (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" />
                    </View>
                )}

                {!screenLoading && error && (
                    <ThemedCard style={styles.messageCard}>
                        <ThemedText style={styles.errorText}>{error}</ThemedText>
                        <Pressable
                            onPress={() => void loadTasks()}
                            style={styles.retryButton}
                        >
                            <ThemedText type="link">Retry</ThemedText>
                        </Pressable>
                    </ThemedCard>
                )}

                {!screenLoading && !error && sortedTasks.length === 0 && (
                    <ThemedCard style={styles.messageCard}>
                        <ThemedText>
                            No maintenance tasks found for your assigned
                            vehicle.
                        </ThemedText>
                    </ThemedCard>
                )}

                {!screenLoading &&
                    !error &&
                    sortedTasks.map((task) => (
                        <ThemedCard
                            key={`${task.title}-${task.date}`}
                            style={styles.card}
                        >
                            <View style={styles.headerRow}>
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={styles.title}
                                >
                                    {task.title}
                                </ThemedText>
                                <View
                                    style={[
                                        styles.badge,
                                        getStatusStyle(task.status),
                                    ]}
                                >
                                    <ThemedText
                                        style={styles.badgeText}
                                        lightColor="#fff"
                                        darkColor="#fff"
                                    >
                                        {task.status}
                                    </ThemedText>
                                </View>
                            </View>

                            <ThemedText style={styles.metaText}>
                                Date: {task.date}
                            </ThemedText>
                            <ThemedText style={styles.metaText}>
                                Timeline:{' '}
                                {task.status === 'Completed'
                                    ? 'Completed work'
                                    : task.status === 'In Progress'
                                      ? 'Current task'
                                      : 'Upcoming task'}
                            </ThemedText>
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
