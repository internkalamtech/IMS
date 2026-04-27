import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { ThemedCard } from '../ThemedCard';
import { ThemedText } from '../ThemedText';
import { useTheme } from '@/core/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface FeeSummaryCardProps {
    totalFees: number;
    paidAmount: number;
    nextDueDate?: string;
}

export function FeeSummaryCard({ totalFees, paidAmount, nextDueDate }: FeeSummaryCardProps) {
    const { theme } = useTheme();
    const router = useRouter();
    const balanceDue = totalFees - paidAmount;
    const percentagePaid = totalFees > 0 ? (paidAmount / totalFees) * 100 : 0;

    // Format currency
    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No due date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleViewDetails = () => {
        router.push('/fee-details');
    };

    return (
        <TouchableOpacity onPress={handleViewDetails} activeOpacity={0.8}>
            {/* Header */}
            <View style={styles.headerRow}>
                <ThemedText type="subtitle" style={styles.title}>Fee Summary</ThemedText>
                <View style={[styles.badge, { backgroundColor: percentagePaid > 75 ? '#10b98120' : '#f5a62320' }]}>
                    <ThemedText style={[styles.badgeText, { color: percentagePaid > 75 ? '#10b981' : '#f5a623' }]}>
                        {Math.round(percentagePaid)}% Paid
                    </ThemedText>
                </View>
            </View>

            {/* Summary Stats - Three Column Layout */}
            <View style={styles.statsContainer}>
                {/* Total Fees */}
                <View style={styles.statBox}>
                    <View style={[styles.statIcon, { backgroundColor: '#3b82f620' }]}>
                        <Ionicons name="receipt-outline" size={20} color="#3b82f6" />
                    </View>
                    <ThemedText style={styles.statLabel} lightColor="#666" darkColor="#999">
                        Total Fees
                    </ThemedText>
                    <ThemedText style={styles.statValue} type="defaultSemiBold">
                        {formatCurrency(totalFees)}
                    </ThemedText>
                </View>

                {/* Paid Amount */}
                <View style={styles.statBox}>
                    <View style={[styles.statIcon, { backgroundColor: '#10b98120' }]}>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" />
                    </View>
                    <ThemedText style={styles.statLabel} lightColor="#666" darkColor="#999">
                        Paid Amount
                    </ThemedText>
                    <ThemedText style={[styles.statValue, { color: '#10b981' }]} type="defaultSemiBold">
                        {formatCurrency(paidAmount)}
                    </ThemedText>
                </View>

                {/* Balance Due */}
                <View style={styles.statBox}>
                    <View style={[styles.statIcon, { backgroundColor: balanceDue > 0 ? '#f5a62320' : '#10b98120' }]}>
                        <Ionicons 
                            name={balanceDue > 0 ? "alert-circle-outline" : "checkmark-circle"} 
                            size={20} 
                            color={balanceDue > 0 ? '#f5a623' : '#10b981'} 
                        />
                    </View>
                    <ThemedText style={styles.statLabel} lightColor="#666" darkColor="#999">
                        Balance Due
                    </ThemedText>
                    <ThemedText style={[styles.statValue, { color: balanceDue > 0 ? '#f5a623' : '#10b981' }]} type="defaultSemiBold">
                        {formatCurrency(balanceDue)}
                    </ThemedText>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
                <View style={styles.progressLabelRow}>
                    <ThemedText style={styles.progressLabel} lightColor="#666" darkColor="#999">
                        Payment Progress
                    </ThemedText>
                    <ThemedText style={styles.progressPercent} type="defaultSemiBold">
                        {Math.round(percentagePaid)}%
                    </ThemedText>
                </View>
                <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                    <View 
                        style={[
                            styles.progressFill, 
                            { 
                                width: `${Math.min(percentagePaid, 100)}%`,
                                backgroundColor: percentagePaid > 75 ? '#10b981' : percentagePaid > 50 ? '#3b82f6' : '#f5a623'
                            }
                        ]} 
                    />
                </View>
            </View>

            {/* Next Due Date */}
            {nextDueDate && (
                <View style={styles.dueDateSection}>
                    <View style={[styles.dueDateIcon, { backgroundColor: '#ef444420' }]}>
                        <Ionicons name="calendar-outline" size={18} color="#ef4444" />
                    </View>
                    <View style={styles.dueDateContent}>
                        <ThemedText style={styles.dueDateLabel} lightColor="#666" darkColor="#999">
                            Next Due Date
                        </ThemedText>
                        <ThemedText style={styles.dueDateValue} type="defaultSemiBold">
                            {formatDate(nextDueDate)}
                        </ThemedText>
                    </View>
                </View>
            )}

            {/* View Details Button */}
            <View style={styles.viewDetailsRow}>
                <ThemedText style={styles.viewDetailsText}>View Breakdown & Installments</ThemedText>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
            </View>
        </ThemedCard>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 0,
        marginBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 12,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 11,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    progressSection: {
        marginBottom: 16,
    },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 12,
    },
    progressPercent: {
        fontSize: 12,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    dueDateSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    dueDateIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    dueDateContent: {
        flex: 1,
    },
    dueDateLabel: {
        fontSize: 11,
        marginBottom: 2,
    },
    dueDateValue: {
        fontSize: 13,
        fontWeight: '600',
    },
    viewDetailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    viewDetailsText: {
        fontSize: 13,
        fontWeight: '500',
    },
});
