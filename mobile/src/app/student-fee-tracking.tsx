import React from 'react';
import { View, ScrollView, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/presentation/components/ThemedView';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { FeeSummaryCard } from '@/presentation/components/dashboard/FeeSummaryCard';
import { useTheme } from '@/core/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface StudentFeeData {
    studentName: string;
    studentClass: string;
    rollNumber: string;
    totalFees: number;
    paidAmount: number;
    nextDueDate?: string;
}

export default function StudentFeeTrackingScreen() {
    const router = useRouter();
    const { theme } = useTheme();

    // Sample data - In a real app, this would come from an API based on the logged-in student
    const studentFeeData: StudentFeeData = {
        studentName: 'Aarav Kumar',
        studentClass: 'Class 7-B',
        rollNumber: 'A-023',
        totalFees: 50000,
        paidAmount: 35000,
        nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const balanceDue = studentFeeData.totalFees - studentFeeData.paidAmount;
    const percentagePaid = studentFeeData.totalFees > 0 ? (studentFeeData.paidAmount / studentFeeData.totalFees) * 100 : 0;

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    const recentPayments = [
        {
            id: 1,
            date: '2024-06-25',
            amount: 10850,
            receipt: 'REC-2024-A3F7',
            mode: 'UPI',
        },
        {
            id: 2,
            date: '2024-03-28',
            amount: 10850,
            receipt: 'REC-2024-B5K2',
            mode: 'Card',
        },
        {
            id: 3,
            date: '2024-01-15',
            amount: 13300,
            receipt: 'REC-2024-C7M9',
            mode: 'Cash',
        },
    ];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
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
                    Fee & Payment Tracking
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
                                {studentFeeData.studentName}
                            </ThemedText>
                            <ThemedText lightColor="#666" darkColor="#999" style={styles.studentMeta}>
                                {studentFeeData.studentClass} • Roll {studentFeeData.rollNumber}
                            </ThemedText>
                        </View>
                    </View>
                </ThemedCard>

                {/* Fee Summary */}
                <View style={styles.section}>
                    <FeeSummaryCard 
                        totalFees={studentFeeData.totalFees}
                        paidAmount={studentFeeData.paidAmount}
                        nextDueDate={studentFeeData.nextDueDate}
                    />
                </View>

                {/* Status Alert */}
                {balanceDue > 0 && (
                    <View style={styles.section}>
                        <ThemedCard style={[styles.alertCard, { borderLeftWidth: 4, borderLeftColor: '#f59e0b' }]} padding={12}>
                            <View style={styles.alertContent}>
                                <Ionicons name="alert-circle" size={20} color="#f59e0b" />
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <ThemedText type="defaultSemiBold" style={styles.alertTitle}>
                                        Payment Pending
                                    </ThemedText>
                                    <ThemedText lightColor="#666" darkColor="#999" style={styles.alertText}>
                                        {formatCurrency(balanceDue)} due by {studentFeeData.nextDueDate ? new Date(studentFeeData.nextDueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'soon'}
                                    </ThemedText>
                                </View>
                            </View>
                        </ThemedCard>
                    </View>
                )}

                {/* Quick Stats */}
                <View style={styles.section}>
                    <View style={styles.statsGrid}>
                        <ThemedCard style={styles.statCard} padding={12}>
                            <Ionicons name="checkmark-circle" size={24} color="#10b981" style={{ marginBottom: 8 }} />
                            <ThemedText lightColor="#666" darkColor="#999" style={styles.statLabel}>
                                Total Paid
                            </ThemedText>
                            <ThemedText type="defaultSemiBold" style={styles.statValue}>
                                {formatCurrency(studentFeeData.paidAmount)}
                            </ThemedText>
                        </ThemedCard>

                        <ThemedCard style={styles.statCard} padding={12}>
                            <Ionicons name="hourglass" size={24} color="#f59e0b" style={{ marginBottom: 8 }} />
                            <ThemedText lightColor="#666" darkColor="#999" style={styles.statLabel}>
                                Remaining
                            </ThemedText>
                            <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: '#f59e0b' }]}>
                                {formatCurrency(balanceDue)}
                            </ThemedText>
                        </ThemedCard>

                        <ThemedCard style={styles.statCard} padding={12}>
                            <Ionicons name="trending-up" size={24} color="#3b82f6" style={{ marginBottom: 8 }} />
                            <ThemedText lightColor="#666" darkColor="#999" style={styles.statLabel}>
                                Progress
                            </ThemedText>
                            <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: '#3b82f6' }]}>
                                {Math.round(percentagePaid)}%
                            </ThemedText>
                        </ThemedCard>
                    </View>
                </View>

                {/* Recent Payments Section */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Recent Payments</ThemedText>

                    <ThemedCard style={styles.paymentsList} padding={0}>
                        {recentPayments.map((payment, index) => (
                            <View
                                key={payment.id}
                                style={[
                                    styles.paymentItem,
                                    index !== recentPayments.length - 1 && {
                                        borderBottomWidth: 1,
                                        borderBottomColor: 'rgba(0,0,0,0.1)',
                                    },
                                ]}
                            >
                                <View style={[styles.paymentIcon, { backgroundColor: '#10b98120' }]}>
                                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                </View>
                                <View style={styles.paymentDetails}>
                                    <ThemedText type="defaultSemiBold" style={styles.paymentDate}>
                                        {formatDate(payment.date)}
                                    </ThemedText>
                                    <ThemedText lightColor="#666" darkColor="#999" style={styles.paymentReceipt}>
                                        {payment.receipt} • {payment.mode}
                                    </ThemedText>
                                </View>
                                <ThemedText type="defaultSemiBold" style={styles.paymentAmount}>
                                    {formatCurrency(payment.amount)}
                                </ThemedText>
                            </View>
                        ))}
                    </ThemedCard>
                </View>

                {/* View Detailed Breakdown */}
                <View style={styles.section}>
                    <TouchableOpacity 
                        style={[styles.detailedButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => router.push('/fee-details')}
                    >
                        <ThemedText 
                            style={styles.detailedButtonText}
                            lightColor={theme.colors.primaryForeground}
                            darkColor={theme.colors.primaryForeground}
                            type="defaultSemiBold"
                        >
                            View Detailed Breakdown & Installments
                        </ThemedText>
                        <Ionicons name="chevron-forward" size={18} color={theme.colors.primaryForeground} />
                    </TouchableOpacity>
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
    alertCard: {
        backgroundColor: '#f59e0b10',
    },
    alertContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    alertTitle: {
        fontSize: 13,
        marginBottom: 2,
    },
    alertText: {
        fontSize: 11,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 11,
        marginBottom: 4,
        textAlign: 'center',
    },
    statValue: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
    paymentsList: {
        marginBottom: 16,
    },
    paymentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    paymentIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    paymentDetails: {
        flex: 1,
    },
    paymentDate: {
        fontSize: 13,
        marginBottom: 2,
    },
    paymentReceipt: {
        fontSize: 11,
    },
    paymentAmount: {
        fontSize: 13,
        fontWeight: '600',
    },
    detailedButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
    },
    detailedButtonText: {
        fontSize: 14,
    },
});
