import { DriverRepositoryImpl } from '@/data/repositories/driver-repository-impl';
import { ComplianceDocument } from '@/domain/entities/compliance-document';
import { GetDriverDocumentsUseCase } from '@/domain/usecases/get-driver-documents-usecase';
<<<<<<< HEAD
=======
import { useAuth } from '@/presentation/hooks/useAuth';
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
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

const driverRepository = new DriverRepositoryImpl();
<<<<<<< HEAD
const getDriverDocumentsUseCase = new GetDriverDocumentsUseCase(
    driverRepository
);
=======
const getDriverDocumentsUseCase = new GetDriverDocumentsUseCase(driverRepository);
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89

type ComplianceStatus = 'Expired' | 'Expiring Soon' | 'Valid';

function getComplianceStatus(expiryDate: string): ComplianceStatus {
<<<<<<< HEAD
    const daysLeft = getDaysLeft(expiryDate);
=======
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / millisecondsPerDay);
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89

    if (daysLeft < 0) {
        return 'Expired';
    }

    if (daysLeft <= 7) {
        return 'Expiring Soon';
    }

    return 'Valid';
}

<<<<<<< HEAD
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

export default function ComplianceScreen() {
=======
export default function ComplianceScreen() {
    const { authReady, user } = useAuth();
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
    const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

<<<<<<< HEAD
    const loadDocuments = useCallback(async (isRefresh = false) => {
=======
    const loadDocuments = useCallback(async (isRefresh: boolean = false) => {
        if (!authReady || !user) {
            setError('No token available');
            setLoading(false);
            setRefreshing(false);
            return;
        }

>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError(null);

        try {
            const driverDocuments = await getDriverDocumentsUseCase.execute();
            setDocuments(driverDocuments);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to load documents');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
<<<<<<< HEAD
    }, []);

    useEffect(() => {
        void loadDocuments();
    }, [loadDocuments]);
=======
    }, [authReady, user]);

    useEffect(() => {
        if (!authReady) {
            return;
        }

        if (!user) {
            setDocuments([]);
            setError('No token available');
            setLoading(false);
            setRefreshing(false);
            return;
        }

        void loadDocuments();
    }, [authReady, loadDocuments, user]);
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89

    const getStatusStyle = (status: ComplianceStatus) => {
        switch (status) {
            case 'Expired':
                return styles.expired;
            case 'Expiring Soon':
                return styles.expiringSoon;
            case 'Valid':
                return styles.valid;
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
<<<<<<< HEAD
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => loadDocuments(true)}
                    />
=======
                    <RefreshControl refreshing={refreshing} onRefresh={() => loadDocuments(true)} />
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
                }
            >
                <ThemedText type="title" style={styles.heading}>
                    License Compliance
                </ThemedText>
                <ThemedText style={styles.subheading}>
<<<<<<< HEAD
                    Track expiry dates for the documents tied to your assigned
                    vehicle.
=======
                    Track expiry dates for the documents tied to your assigned vehicle.
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
                </ThemedText>

                {loading && (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" />
                    </View>
                )}

                {!loading && error && (
                    <ThemedCard style={styles.messageCard}>
                        <ThemedText style={styles.errorText}>{error}</ThemedText>
<<<<<<< HEAD
                        <Pressable
                            onPress={() => loadDocuments()}
                            style={styles.retryButton}
                        >
=======
                        <Pressable onPress={() => loadDocuments()} style={styles.retryButton}>
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
                            <ThemedText type="link">Retry</ThemedText>
                        </Pressable>
                    </ThemedCard>
                )}

                {!loading && !error && documents.length === 0 && (
                    <ThemedCard style={styles.messageCard}>
<<<<<<< HEAD
                        <ThemedText>
                            No compliance documents found for your assigned
                            vehicle.
                        </ThemedText>
                    </ThemedCard>
                )}

                {!loading &&
                    !error &&
                    documents.map((document) => {
                        const status = getComplianceStatus(document.expiryDate);
                        const daysLeft = getDaysLeft(document.expiryDate);

                        return (
                            <ThemedCard
                                key={`${document.title}-${document.expiryDate}`}
                                style={styles.card}
                            >
                                <View style={styles.headerRow}>
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={styles.title}
                                    >
                                        {document.title}
                                    </ThemedText>
                                    <View
                                        style={[
                                            styles.badge,
                                            getStatusStyle(status),
                                        ]}
                                    >
                                        <ThemedText
                                            style={styles.badgeText}
                                            lightColor="#fff"
                                            darkColor="#fff"
                                        >
                                            {status}
                                        </ThemedText>
                                    </View>
                                </View>

                                <ThemedText style={styles.metaText}>
                                    Expiry Date: {document.expiryDate}
                                </ThemedText>
                                <ThemedText style={styles.metaText}>
                                    Countdown: {getCountdownLabel(daysLeft)}
                                </ThemedText>
                            </ThemedCard>
                        );
                    })}
=======
                        <ThemedText>No compliance documents found for your assigned vehicle.</ThemedText>
                    </ThemedCard>
                )}

                {!loading && !error && documents.map((document) => {
                    const status = getComplianceStatus(document.expiryDate);

                    return (
                        <ThemedCard key={`${document.title}-${document.expiryDate}`} style={styles.card}>
                            <View style={styles.headerRow}>
                                <ThemedText type="defaultSemiBold" style={styles.title}>
                                    {document.title}
                                </ThemedText>
                                <View style={[styles.badge, getStatusStyle(status)]}>
                                    <ThemedText style={styles.badgeText} lightColor="#fff" darkColor="#fff">
                                        {status}
                                    </ThemedText>
                                </View>
                            </View>

                            <ThemedText style={styles.metaText}>Expiry Date: {document.expiryDate}</ThemedText>
                        </ThemedCard>
                    );
                })}
>>>>>>> 8af8865b070e30b85cf93d3dd14c0890d6c22d89
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
    expired: {
        backgroundColor: '#ef4444',
    },
    expiringSoon: {
        backgroundColor: '#f59e0b',
    },
    valid: {
        backgroundColor: '#22c55e',
    },
});
