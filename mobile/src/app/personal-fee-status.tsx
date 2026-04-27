import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/presentation/components/ThemedView';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { useTheme } from '@/core/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface Receipt {
    id: string;
    receiptNumber: string;
    amount: number;
    date: string;
    mode: string;
    status: string;
    reference?: string;
    remarks?: string;
}

interface PersonalFeeData {
    studentName: string;
    studentClass: string;
    rollNumber: string;
    totalFees: number;
    paidAmount: number;
    balance: number;
}

interface ReceiptDetail {
    id: string;
    receiptNumber: string;
    amount: number;
    date: string;
    mode: string;
    reference?: string;
    remarks?: string;
}

export default function PersonalFeeStatusLedgerScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const [expandedReceiptId, setExpandedReceiptId] = useState<string | null>(null);

    // Sample data
    const feeData: PersonalFeeData = {
        studentName: 'Aarav Kumar',
        studentClass: 'Class 7-B',
        rollNumber: 'A-023',
        totalFees: 50000,
        paidAmount: 35000,
        balance: 15000,
    };

    const receipts: Receipt[] = [
        {
            id: '1',
            receiptNumber: 'REC-2024-A3F7',
            amount: 10850,
            date: '2024-06-25',
            mode: 'UPI',
            status: 'Paid',
            reference: 'UPI1234567890',
            remarks: 'Q2 Payment',
        },
        {
            id: '2',
            receiptNumber: 'REC-2024-B5K2',
            amount: 10850,
            date: '2024-03-28',
            mode: 'Card',
            status: 'Paid',
            reference: 'CARD****1234',
            remarks: 'Q1 Payment',
        },
        {
            id: '3',
            receiptNumber: 'REC-2024-C7M9',
            amount: 13300,
            date: '2024-01-15',
            mode: 'Cash',
            status: 'Paid',
            remarks: 'Initial Payment',
        },
    ];

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const toggleReceiptDetails = (receiptId: string) => {
        setExpandedReceiptId(expandedReceiptId === receiptId ? null : receiptId);
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
                    Personal Fee Status & Ledger
                </ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Student Info */}
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

                {/* Fee Summary Cards */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Fee Summary</ThemedText>
                    
                    <View style={styles.summaryCardsGrid}>
                        <ThemedCard style={[styles.summaryCard, { borderLeftWidth: 4, borderLeftColor: '#3b82f6' }]} padding={14}>
                            <ThemedText lightColor="#666" darkColor="#999" style={styles.summaryCardLabel}>
                                Total Fee
                            </ThemedText>
                            <ThemedText type="defaultSemiBold" style={styles.summaryCardAmount}>
                                {formatCurrency(feeData.totalFees)}
                            </ThemedText>
                        </ThemedCard>

                        <ThemedCard style={[styles.summaryCard, { borderLeftWidth: 4, borderLeftColor: '#10b981' }]} padding={14}>
                            <ThemedText lightColor="#666" darkColor="#999" style={styles.summaryCardLabel}>
                                Paid Amount
                            </ThemedText>
                            <ThemedText type="defaultSemiBold" style={[styles.summaryCardAmount, { color: '#10b981' }]}>
                                {formatCurrency(feeData.paidAmount)}
                            </ThemedText>
                        </ThemedCard>

                        <ThemedCard style={[styles.summaryCard, { borderLeftWidth: 4, borderLeftColor: feeData.balance > 0 ? '#f59e0b' : '#10b981' }]} padding={14}>
                            <ThemedText lightColor="#666" darkColor="#999" style={styles.summaryCardLabel}>
                                Balance Due
                            </ThemedText>
                            <ThemedText type="defaultSemiBold" style={[styles.summaryCardAmount, { color: feeData.balance > 0 ? '#f59e0b' : '#10b981' }]}>
                                {formatCurrency(feeData.balance)}
                            </ThemedText>
                        </ThemedCard>
                    </View>
                </View>

                {/* Fee Installment Plan */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Installment Plan</ThemedText>
                    <ThemedCard style={styles.installmentCard} padding={14}>
                        <View style={styles.installmentRow}>
                            <View style={{ flex: 1 }}>
                                <ThemedText lightColor="#666" darkColor="#999" style={styles.installmentLabel}>
                                    Q1 (Jan - Mar)
                                </ThemedText>
                                <ThemedText type="defaultSemiBold" style={styles.installmentAmount}>
                                    {formatCurrency(13300)}
                                </ThemedText>
                            </View>
                            <View style={[styles.installmentStatus, { backgroundColor: '#10b98120' }]}>
                                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                                <ThemedText style={[styles.installmentStatusText, { color: '#10b981' }]} type="defaultSemiBold">
                                    Paid
                                </ThemedText>
                            </View>
                        </View>
                    </ThemedCard>

                    <ThemedCard style={styles.installmentCard} padding={14}>
                        <View style={styles.installmentRow}>
                            <View style={{ flex: 1 }}>
                                <ThemedText lightColor="#666" darkColor="#999" style={styles.installmentLabel}>
                                    Q2 (Apr - Jun)
                                </ThemedText>
                                <ThemedText type="defaultSemiBold" style={styles.installmentAmount}>
                                    {formatCurrency(10850)}
                                </ThemedText>
                            </View>
                            <View style={[styles.installmentStatus, { backgroundColor: '#10b98120' }]}>
                                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                                <ThemedText style={[styles.installmentStatusText, { color: '#10b981' }]} type="defaultSemiBold">
                                    Paid
                                </ThemedText>
                            </View>
                        </View>
                    </ThemedCard>

                    <ThemedCard style={styles.installmentCard} padding={14}>
                        <View style={styles.installmentRow}>
                            <View style={{ flex: 1 }}>
                                <ThemedText lightColor="#666" darkColor="#999" style={styles.installmentLabel}>
                                    Q3 (Jul - Sep)
                                </ThemedText>
                                <ThemedText type="defaultSemiBold" style={styles.installmentAmount}>
                                    {formatCurrency(10850)}
                                </ThemedText>
                            </View>
                            <View style={[styles.installmentStatus, { backgroundColor: '#f59e0b20' }]}>
                                <Ionicons name="time-outline" size={16} color="#f59e0b" />
                                <ThemedText style={[styles.installmentStatusText, { color: '#f59e0b' }]} type="defaultSemiBold">
                                    Pending
                                </ThemedText>
                            </View>
                        </View>
                    </ThemedCard>

                    <ThemedCard style={styles.installmentCard} padding={14}>
                        <View style={styles.installmentRow}>
                            <View style={{ flex: 1 }}>
                                <ThemedText lightColor="#666" darkColor="#999" style={styles.installmentLabel}>
                                    Q4 (Oct - Dec)
                                </ThemedText>
                                <ThemedText type="defaultSemiBold" style={styles.installmentAmount}>
                                    {formatCurrency(15000)}
                                </ThemedText>
                            </View>
                            <View style={[styles.installmentStatus, { backgroundColor: '#f59e0b20' }]}>
                                <Ionicons name="time-outline" size={16} color="#f59e0b" />
                                <ThemedText style={[styles.installmentStatusText, { color: '#f59e0b' }]} type="defaultSemiBold">
                                    Pending
                                </ThemedText>
                            </View>
                        </View>
                    </ThemedCard>
                </View>

                {/* Transaction & Receipt History */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Transaction History</ThemedText>

                    <ThemedCard style={styles.receiptsCard} padding={0}>
                        {receipts.map((receipt, index) => (
                            <View
                                key={receipt.id}
                                style={[
                                    index !== receipts.length - 1 && {
                                        borderBottomWidth: 1,
                                        borderBottomColor: 'rgba(0,0,0,0.1)',
                                    },
                                ]}
                            >
                                <TouchableOpacity
                                    style={styles.receiptItemHeader}
                                    onPress={() => toggleReceiptDetails(receipt.id)}
                                >
                                    <View style={[styles.receiptIcon, { backgroundColor: '#10b98120' }]}>
                                        <Ionicons name="receipt-outline" size={18} color="#10b981" />
                                    </View>
                                    <View style={styles.receiptInfo}>
                                        <ThemedText type="defaultSemiBold" style={styles.receiptNumber}>
                                            {receipt.receiptNumber}
                                        </ThemedText>
                                        <ThemedText lightColor="#666" darkColor="#999" style={styles.receiptDate}>
                                            {formatDate(receipt.date)} • {receipt.mode}
                                        </ThemedText>
                                    </View>
                                    <View style={styles.receiptRight}>
                                        <ThemedText type="defaultSemiBold" style={styles.receiptAmount}>
                                            {formatCurrency(receipt.amount)}
                                        </ThemedText>
                                        <Ionicons 
                                            name={expandedReceiptId === receipt.id ? 'chevron-up' : 'chevron-down'} 
                                            size={16} 
                                            color={theme.colors.foreground}
                                        />
                                    </View>
                                </TouchableOpacity>

                                {/* Expanded Receipt Details */}
                                {expandedReceiptId === receipt.id && (
                                    <View style={styles.receiptDetails}>
                                        <View style={styles.receiptDetailRow}>
                                            <ThemedText lightColor="#666" darkColor="#999">Amount</ThemedText>
                                            <ThemedText type="defaultSemiBold">{formatCurrency(receipt.amount)}</ThemedText>
                                        </View>
                                        <View style={styles.receiptDetailRow}>
                                            <ThemedText lightColor="#666" darkColor="#999">Payment Mode</ThemedText>
                                            <ThemedText type="defaultSemiBold">{receipt.mode}</ThemedText>
                                        </View>
                                        {receipt.reference && (
                                            <View style={styles.receiptDetailRow}>
                                                <ThemedText lightColor="#666" darkColor="#999">Reference</ThemedText>
                                                <ThemedText type="defaultSemiBold">{receipt.reference}</ThemedText>
                                            </View>
                                        )}
                                        {receipt.remarks && (
                                            <View style={styles.receiptDetailRow}>
                                                <ThemedText lightColor="#666" darkColor="#999">Remarks</ThemedText>
                                                <ThemedText type="defaultSemiBold">{receipt.remarks}</ThemedText>
                                            </View>
                                        )}
                                        <TouchableOpacity style={styles.downloadButton}>
                                            <Ionicons name="download-outline" size={16} color={theme.colors.primary} />
                                            <ThemedText style={{ color: theme.colors.primary, marginLeft: 6 }} type="defaultSemiBold">
                                                Download Receipt
                                            </ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                )}
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
        marginBottom: 20,
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
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    summaryCardsGrid: {
        flexDirection: 'row',
        gap: 10,
    },
    summaryCard: {
        flex: 1,
    },
    summaryCardLabel: {
        fontSize: 11,
        marginBottom: 6,
    },
    summaryCardAmount: {
        fontSize: 15,
        fontWeight: '600',
    },
    installmentCard: {
        marginBottom: 10,
    },
    installmentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    installmentLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    installmentAmount: {
        fontSize: 14,
        fontWeight: '600',
    },
    installmentStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    installmentStatusText: {
        fontSize: 11,
    },
    receiptsCard: {
        marginBottom: 16,
    },
    receiptItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    receiptIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    receiptInfo: {
        flex: 1,
    },
    receiptNumber: {
        fontSize: 13,
        marginBottom: 2,
    },
    receiptDate: {
        fontSize: 11,
    },
    receiptRight: {
        alignItems: 'flex-end',
        gap: 4,
    },
    receiptAmount: {
        fontSize: 13,
        fontWeight: '600',
    },
    receiptDetails: {
        backgroundColor: 'rgba(0,0,0,0.02)',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        marginTop: 0,
    },
    receiptDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
});
