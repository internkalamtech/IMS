import React, { useMemo, useState, useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/theme/ThemeContext';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedTextInput } from '@/presentation/components/ThemedTextInput';
import { useComplianceDocuments } from '../hooks/useComplianceDocuments';

type FilterTab = 'All' | 'Expiring' | 'Expired';

export default function ComplianceDocumentsScreen() {
    const router = useRouter();
    const { theme, isDark } = useTheme();
    const { documents, loading, refreshing, onRefresh, error } = useComplianceDocuments();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<FilterTab>('All');

    // Refresh list when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            onRefresh();
        }, [])
    );

    // Calculate metrics
    const { validCount, expiringCount, expiredCount } = useMemo(() => {
        let valid = 0;
        let expiring = 0;
        let expired = 0;
        documents.forEach((doc) => {
            if (doc.status === 'Expired') expired++;
            else if (doc.status === 'Expiring' || doc.status === 'Expiring-Soon') expiring++;
            else valid++;
        });
        return { validCount: valid, expiringCount: expiring, expiredCount: expired };
    }, [documents]);

    const totalCount = documents.length;

    // Filter documents
    const filteredDocuments = useMemo(() => {
        return documents.filter((doc) => {
            // Apply search
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                (doc.type && doc.type.toLowerCase().includes(query)) ||
                (doc.vehicleName && doc.vehicleName.toLowerCase().includes(query)) ||
                (doc.documentNumber && doc.documentNumber.toLowerCase().includes(query));

            if (!matchesSearch) return false;

            // Apply tab filter
            if (activeTab === 'Expiring') return doc.status === 'Expiring' || doc.status === 'Expiring-Soon';
            if (activeTab === 'Expired') return doc.status === 'Expired';
            return true;
        });
    }, [documents, searchQuery, activeTab]);

    const handleDownload = (docId: number) => {
        // Integrate with existing download service, currently just log
        console.log('Download', docId);
    };

    const handleEdit = (docId: number) => {
        router.push({ pathname: '/add-edit-compliance-document', params: { id: docId } });
    };

    const renderDocumentCard = ({ item }: { item: any }) => {
        const isExpired = item.status === 'Expired';
        const isExpiring = item.status === 'Expiring' || item.status === 'Expiring-Soon';
        const isValid = item.status === 'Valid';

        let badgeColor = '#dcfce7';
        let badgeTextColor = '#166534';
        let badgeText = 'valid';

        if (isExpired) {
            badgeColor = '#fee2e2';
            badgeTextColor = '#dc2626';
            badgeText = 'expired';
        } else if (isExpiring) {
            badgeColor = '#ffedd5';
            badgeTextColor = '#ea580c';
            badgeText = 'expiring soon';
        }

        const formattedIssued = new Date(item.issuedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const formattedExpiry = new Date(item.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        return (
            <ThemedCard style={styles.card} padding={16}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                        <View style={[styles.docIcon, isExpired ? { backgroundColor: '#fee2e2' } : isExpiring ? { backgroundColor: '#ffedd5' } : { backgroundColor: '#dcfce7' }]}>
                            <Ionicons name="document-text" size={24} color={isExpired ? '#dc2626' : isExpiring ? '#ea580c' : '#166534'} />
                        </View>
                        <View style={styles.docInfo}>
                            <ThemedText style={styles.docTitle} type="defaultSemiBold">{item.type}</ThemedText>
                            <ThemedText style={styles.docSubtitle} lightColor="#6b7280" darkColor="#9ca3af">{item.vehicleName || 'Unknown'}</ThemedText>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
                        <ThemedText style={[styles.statusText, { color: badgeTextColor }]}>{badgeText}</ThemedText>
                    </View>
                </View>

                <View style={styles.docDetails}>
                    <ThemedText style={styles.docMeta} lightColor="#6b7280" darkColor="#9ca3af">
                        Doc #: {item.documentNumber || 'N/A'}
                    </ThemedText>
                    <View style={styles.dateContainer}>
                        <ThemedText style={styles.docMeta} lightColor="#6b7280" darkColor="#9ca3af">
                            Issued: {formattedIssued}
                        </ThemedText>
                        <View style={styles.expiryContainer}>
                            <Ionicons name="calendar-outline" size={14} color={isExpired ? '#dc2626' : isExpiring ? '#ea580c' : '#6b7280'} style={styles.expiryIcon} />
                            <ThemedText style={[styles.docMeta, isExpired || isExpiring ? { color: isExpired ? '#dc2626' : '#ea580c', fontWeight: '500' } : {}]}>
                                Expires: {formattedExpiry} {item.daysLeft >= 0 ? `(${item.daysLeft} days)` : ''}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleDownload(item.id)}>
                        <Ionicons name="download-outline" size={16} color={theme.colors.foreground} />
                        <ThemedText style={styles.actionButtonText}>Download</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item.id)}>
                        <Ionicons name="pencil-outline" size={16} color={theme.colors.foreground} />
                        <ThemedText style={styles.actionButtonText}>Edit</ThemedText>
                    </TouchableOpacity>
                </View>
            </ThemedCard>
        );
    };

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Blue Banner Header Area */}
            <View style={[styles.banner, { backgroundColor: theme.colors.primary }]}>
                <SafeAreaView edges={['top']}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <ThemedText style={styles.headerTitle} lightColor="#fff" darkColor="#fff" type="title">Compliance Documents</ThemedText>
                            <ThemedText style={styles.headerSubtitle} lightColor="#fff" darkColor="#fff">{totalCount} documents tracked</ThemedText>
                        </View>
                        <TouchableOpacity style={styles.uploadButton} onPress={() => router.push('/add-edit-compliance-document')}>
                            <Ionicons name="push-outline" size={16} color={theme.colors.primary} />
                            <ThemedText style={[styles.uploadButtonText, { color: theme.colors.primary }]}>Upload</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <ThemedText style={styles.statNumber} lightColor="#fff" darkColor="#fff">{totalCount}</ThemedText>
                            <ThemedText style={styles.statLabel} lightColor="rgba(255,255,255,0.8)" darkColor="rgba(255,255,255,0.8)">Total</ThemedText>
                        </View>
                        <View style={styles.statBox}>
                            <ThemedText style={[styles.statNumber, { color: '#4ade80' }]}>{validCount}</ThemedText>
                            <ThemedText style={styles.statLabel} lightColor="rgba(255,255,255,0.8)" darkColor="rgba(255,255,255,0.8)">Valid</ThemedText>
                        </View>
                        <View style={styles.statBox}>
                            <ThemedText style={[styles.statNumber, { color: '#fbbf24' }]}>{expiringCount}</ThemedText>
                            <ThemedText style={styles.statLabel} lightColor="rgba(255,255,255,0.8)" darkColor="rgba(255,255,255,0.8)">Expiring</ThemedText>
                        </View>
                        <View style={styles.statBox}>
                            <ThemedText style={[styles.statNumber, { color: '#f87171' }]}>{expiredCount}</ThemedText>
                            <ThemedText style={styles.statLabel} lightColor="rgba(255,255,255,0.8)" darkColor="rgba(255,255,255,0.8)">Expired</ThemedText>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
                        <ThemedTextInput
                            style={[styles.searchInput, { color: '#fff' }]}
                            placeholder="Search documents..."
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </SafeAreaView>
            </View>

            {/* Main Content Area */}
            <View style={[styles.mainContent, { backgroundColor: theme.colors.background }]}>
                {/* Filter Tabs */}
                <View style={styles.tabsContainer}>
                    {(['All', 'Expiring', 'Expired'] as FilterTab[]).map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tabButton,
                                activeTab === tab ? [styles.activeTab, { backgroundColor: theme.colors.primary }] : null
                            ]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <ThemedText style={[
                                styles.tabText,
                                activeTab === tab ? { color: '#fff', fontWeight: 'bold' } : {}
                            ]}>
                                {tab} ({tab === 'All' ? totalCount : tab === 'Expiring' ? expiringCount : expiredCount})
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Document List */}
                <FlatList
                    data={filteredDocuments}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderDocumentCard}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                    ListEmptyComponent={
                        !loading ? <ThemedText style={styles.emptyText}>{error ? `Error: ${error}` : "No documents found."}</ThemedText> : null
                    }
                />
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    banner: {
        paddingBottom: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 13,
        opacity: 0.9,
    },
    uploadButton: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 4,
    },
    uploadButtonText: {
        fontWeight: '600',
        fontSize: 14,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    statBox: {
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        minWidth: 75,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginHorizontal: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        borderWidth: 0,
        backgroundColor: 'transparent',
    },
    mainContent: {
        flex: 1,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    tabButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    activeTab: {
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
    },
    listContainer: {
        padding: 16,
        gap: 16,
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: 'transparent',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        flex: 1,
    },
    docIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    docInfo: {
        flex: 1,
    },
    docTitle: {
        fontSize: 16,
    },
    docSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    docDetails: {
        marginBottom: 16,
        gap: 4,
    },
    docMeta: {
        fontSize: 13,
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    expiryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    expiryIcon: {
        marginRight: 4,
    },
    cardActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 12,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 20,
        gap: 8,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#9ca3af',
    },
});
