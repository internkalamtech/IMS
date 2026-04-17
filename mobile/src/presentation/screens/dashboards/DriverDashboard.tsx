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

import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { useAuth } from '@/presentation/hooks/useAuth';

const driverRepository = new DriverRepositoryImpl();
const getDriverDocumentsUseCase = new GetDriverDocumentsUseCase(driverRepository);
const getDriverMaintenanceUseCase = new GetDriverMaintenanceUseCase(driverRepository);

export default function DriverDashboard() {
    const { logout, user } = useAuth();
    const { theme } = useTheme();

    const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
    const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        const [docs, maint] = await Promise.all([
            getDriverDocumentsUseCase.execute(),
            getDriverMaintenanceUseCase.execute(),
        ]);

        setDocuments(docs);
        setTasks(maint);
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={[styles.banner, { backgroundColor: theme.colors.primary }]}>
                    <SafeAreaView edges={['top']}>
                        <View style={styles.header}>
                            <ThemedText style={styles.title}>
                                {user?.name || 'Driver'}
                            </ThemedText>

                            <TouchableOpacity onPress={logout}>
                                <Ionicons name="log-out-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>

                <View style={styles.content}>
                    <ThemedText type="subtitle">Driver Tools</ThemedText>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.push('/(tabs)/compliance')}
                    >
                        <ThemedText style={{ color: '#fff' }}>
                            Open Compliance
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.buttonSecondary}
                        onPress={() => router.push('/(tabs)/maintenance')}
                    >
                        <ThemedText>Open Maintenance</ThemedText>
                    </TouchableOpacity>

                    <ThemedText type="subtitle">Documents</ThemedText>

                    {documents.map((doc, i) => (
                        <ThemedCard key={i}>
                            <ThemedText>{doc.title}</ThemedText>
                            <ThemedText>{doc.expiryDate}</ThemedText>
                        </ThemedCard>
                    ))}

                    <ThemedText type="subtitle">Maintenance</ThemedText>

                    {tasks.map((task, i) => (
                        <ThemedCard key={i}>
                            <ThemedText>{task.title}</ThemedText>
                            <ThemedText>{task.date}</ThemedText>
                            <ThemedText>{task.status}</ThemedText>
                        </ThemedCard>
                    ))}
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    banner: { padding: 20 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: { color: '#fff', fontSize: 20 },
    content: { padding: 20 },
    button: {
        backgroundColor: '#2563eb',
        padding: 10,
        marginVertical: 5,
        borderRadius: 8,
    },
    buttonSecondary: {
        borderWidth: 1,
        padding: 10,
        marginVertical: 5,
        borderRadius: 8,
    },
});
