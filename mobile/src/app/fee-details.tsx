import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, SectionList, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/presentation/components/ThemedView';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { useTheme } from '@/core/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

interface FeeComponent {
    id: string;
    name: string;
    amount: number;
    type: 'Mandatory' | 'Optional';
}

interface Installment {
    id: string;
    dueDate: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Overdue';
    paymentDate?: string;
}

interface FeeData {
    studentName: string;
    studentClass: string;
    rollNumber: string;
    feeComponents: FeeComponent[];
    installments: Installment[];
}

export default function FeeDetailsScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const params = useLocalSearchParams();

    // Sample data - In a real app, this would come from an API
    const feeData: FeeData = {
        studentName: 'Aarav Kumar',
        studentClass: 'Class 7-B',
        rollNumber: 'A-023',
        feeComponents: [
            { id: '1', name: 'Tuition Fee', amount: 25000, type: 'Mandatory' },
            { id: '2', name: 'Lab Fee', amount: 5000, type: 'Mandatory' },
            { id: '3', name: 'Sports Fee', amount: 3000, type: 'Optional' },
            { id: '4', name: 'Transport Fee', amount: 8000, type: 'Mandatory' },
            { id: '5', name: 'Library Fee', amount: 2000, type: 'Optional' },
        ],
        installments: [
            {
                id: '1',
                dueDate: '2024-03-31',
                amount: 10850,
                status: 'Paid',
                paymentDate: '2024-03-28',
            },
            {
                id: '2',
                dueDate: '2024-06-30',
                amount: 10850,
                status: 'Paid',
                paymentDate: '2024-06-25',
            },
            {
                id: '3',
                dueDate: '2024-09-30',
                amount: 10850,
                status: 'Pending',
            },
            {
                id: '4',
                dueDate: '2024-12-31',
                amount: 10850,
                status: 'Pending',
            },
        ],
    };

    const totalFees = feeData.feeComponents.reduce((sum, fee) => sum + fee.amount, 0);
    const mandatoryFees = feeData.feeComponents
        .filter(f => f.type === 'Mandatory')
        .reduce((sum, f) => sum + f.amount, 0);
    const optionalFees = feeData.feeComponents
        .filter(f => f.type === 'Optional')
        .reduce((sum, f) => sum + f.amount, 0);

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Paid':
                return '#10b981';
            case 'Pending':
                return '#f59e0b';
            case 'Overdue':
                return '#ef4444';
            default:
                return '#666666';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Paid':
                return 'checkmark-circle';
            case 'Pending':
                return 'time-outline';
            case 'Overdue':
                return 'alert-circle';
            default:
                return 'help-circle-outline';
        }
    };

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.primaryForeground} />
                </TouchableOpacity>
                <ThemedText 
                    style={styles.headerTitle} 
                    type="defaultSemiBold"
                    lightColor={theme.colors.primaryForeground}
                    darkColor={theme.colors.primaryForeground}
                >
                    Fee Details & Installments
                </ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Student Info Card */}
                <ThemedCard style={styles.studentCard} padding={16}>
                    <View style={styles.studentInfoRow}>
                        <View style={[styles.studentAvatar, { backgroundColor: theme.colors.primary + '20' }]}>
                            <ThemedText style={{ color: theme.colors.primary, fontWeight: '700' }}>AK</ThemedText>
                        </View>
                        <View>
                            <ThemedText type="defaultSemiBold" style={styles.studentName}>
                                {feeData.studentName}
                            </ThemedText>
                            <ThemedText lightColor="#666" darkColor="#999" style={styles.studentMeta}>
                                {feeData.studentClass} • Roll {feeData.rollNumber}
                            </ThemedText>
                        </View>
                    </View>
                </ThemedCard>

                {/* Fee Breakdown Section */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Fee Breakdown</ThemedText>

                    {/* Fee Summary Cards */}
                    <View style={styles.summaryRow}>
                        <ThemedCard style={[styles.summaryCard, { borderLeftWidth: 4, borderLeftColor: '#3b82f6' }]} padding={12}>
                            <ThemedText lightColor="#666" darkColor="#999" style={styles.summaryLabel}>
                                Total Fees
                            </ThemedText>
                            <ThemedText type="defaultSemiBold" style={styles.summaryAmount}>
                                {formatCurrency(totalFees)}
                            </ThemedText>
                        </ThemedCard>
                        <ThemedCard style={[styles.summaryCard, { borderLeftWidth: 4, borderLeftColor: '#10b981' }]} padding={12}>
                            <ThemedText lightColor="#666" darkColor="#999" style={styles.summaryLabel}>
                                Mandatory
                            </ThemedText>
                            <ThemedText type="defaultSemiBold" style={styles.summaryAmount}>
                                {formatCurrency(mandatoryFees)}
                            </ThemedText>
                        </ThemedCard>
                        <ThemedCard style={[styles.summaryCard, { borderLeftWidth: 4, borderLeftColor: '#f59e0b' }]} padding={12}>
                            <ThemedText lightColor="#666" darkColor="#999" style={styles.summaryLabel}>
                                Optional
                            </ThemedText>
                            <ThemedText type="defaultSemiBold" style={styles.summaryAmount}>
                                {formatCurrency(optionalFees)}
                            </ThemedText>
                        </ThemedCard>
                    </View>

                    {/* Fee Components List */}
                    <ThemedCard style={styles.componentsList} padding={0}>
                        {feeData.feeComponents.map((component, index) => (
                            <View
                                key={component.id}
                                style={[
                                    styles.componentItem,
                                    index !== feeData.feeComponents.length - 1 && {
                                        borderBottomWidth: 1,
                                        borderBottomColor: 'rgba(0,0,0,0.1)',
                                    },
                                ]}
                            >
                                <View style={styles.componentLeft}>
                                    <ThemedText type="defaultSemiBold" style={styles.componentName}>
                                        {component.name}
                                    </ThemedText>
                                    <View style={styles.typeBadge}>
                                        <ThemedText
                                            lightColor={component.type === 'Mandatory' ? '#10b981' : '#f59e0b'}
                                            darkColor={component.type === 'Mandatory' ? '#10b981' : '#f59e0b'}
                                            style={styles.typeText}
                                        >
                                            {component.type}
                                        </ThemedText>
                                    </View>
                                </View>
                                <ThemedText type="defaultSemiBold" style={styles.componentAmount}>
                                    {formatCurrency(component.amount)}
                                </ThemedText>
                            </View>
                        ))}
                    </ThemedCard>
                </View>

                {/* Installment Timeline Section */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Installment Timeline</ThemedText>

                    <ThemedCard style={styles.installmentsList} padding={0}>
                        {feeData.installments.map((installment, index) => (
                            <View
                                key={installment.id}
                                style={[
                                    styles.installmentItem,
                                    index !== feeData.installments.length - 1 && {
                                        borderBottomWidth: 1,
                                        borderBottomColor: 'rgba(0,0,0,0.1)',
                                    },
                                ]}
                            >
                                {/* Timeline Dot */}
                                <View style={styles.installmentTimeline}>
                                    <View
                                        style={[
                                            styles.timelineDot,
                                            { borderColor: getStatusColor(installment.status) },
                                        ]}
                                    >
                                        <Ionicons
                                            name={getStatusIcon(installment.status) as any}
                                            size={12}
                                            color={getStatusColor(installment.status)}
                                        />
                                    </View>
                                    {index !== feeData.installments.length - 1 && (
                                        <View
                                            style={[
                                                styles.timelineLine,
                                                { backgroundColor: getStatusColor(installment.status) + '20' },
                                            ]}
                                        />
                                    )}
                                </View>

                                {/* Installment Details */}
                                <View style={styles.installmentContent}>
                                    <View style={styles.installmentHeader}>
                                        <View>
                                            <ThemedText type="defaultSemiBold" style={styles.dueDateLabel}>
                                                Due: {formatDate(installment.dueDate)}
                                            </ThemedText>
                                            <ThemedText
                                                lightColor={getStatusColor(installment.status)}
                                                darkColor={getStatusColor(installment.status)}
                                                style={styles.statusText}
                                            >
                                                {installment.status}
                                            </ThemedText>
                                        </View>
                                        <ThemedText type="defaultSemiBold" style={styles.installmentAmount}>
                                            {formatCurrency(installment.amount)}
                                        </ThemedText>
                                    </View>
                                    {installment.paymentDate && (
                                        <ThemedText lightColor="#666" darkColor="#999" style={styles.paymentDateText}>
                                            Paid on {formatDate(installment.paymentDate)}
                                        </ThemedText>
                                    )}
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
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 50,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    studentCard: {
        marginBottom: 24,
    },
    studentInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    studentAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    studentMeta: {
        fontSize: 12,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 8,
    },
    summaryCard: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 11,
        marginBottom: 4,
    },
    summaryAmount: {
        fontSize: 14,
        fontWeight: '600',
    },
    componentsList: {
        marginBottom: 16,
    },
    componentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    componentLeft: {
        flex: 1,
    },
    componentName: {
        fontSize: 14,
        marginBottom: 4,
    },
    typeBadge: {
        alignSelf: 'flex-start',
    },
    typeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    componentAmount: {
        fontSize: 14,
        fontWeight: '600',
    },
    installmentsList: {
        marginBottom: 16,
    },
    installmentItem: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    installmentTimeline: {
        alignItems: 'center',
        marginRight: 16,
    },
    timelineDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timelineLine: {
        width: 2,
        height: 40,
        marginTop: 4,
    },
    installmentContent: {
        flex: 1,
    },
    installmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    dueDateLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    installmentAmount: {
        fontSize: 14,
        fontWeight: '600',
    },
    paymentDateText: {
        fontSize: 12,
    },
});
