import React, { useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/core/theme/ThemeContext';
import { ThemedView } from '@/presentation/components/ThemedView';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { Ionicons } from '@expo/vector-icons';

interface FeeSummary {
  student_id: string;
  total_fee: number;
  paid_amount: number;
  balance_due: number;
  next_due_date: string | null;
  status_percentage: number;
}

export function FeeStatusScreen() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feeSummary, setFeeSummary] = useState<FeeSummary>({
    student_id: 'std-123',
    total_fee: 70000,
    paid_amount: 35000,
    balance_due: 35000,
    next_due_date: '2024-05-15',
    status_percentage: 50,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // TODO: Fetch from API
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const ProgressBar = ({ percentage }: { percentage: number }) => (
    <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.border }]}>
      <View
        style={[
          styles.progressBar,
          {
            backgroundColor: percentage > 75 ? '#10b981' : percentage > 50 ? '#f59e0b' : '#ef4444',
            width: `${percentage}%`,
          },
        ]}
      />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {/* Header */}
        <SafeAreaView edges={['top']}>
          <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
            <ThemedText style={styles.headerTitle} type="title" color="primaryForeground">
              Fee Status & Ledger
            </ThemedText>
          </View>
        </SafeAreaView>

        {/* Fee Summary Cards */}
        <View style={styles.cardsContainer}>
          {/* Total Fee Card */}
          <ThemedCard style={[styles.summaryCard, { backgroundColor: theme.colors.primary + '10' }]} padding={16}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="calculator" size={24} color={theme.colors.primary} />
              </View>
              <ThemedText style={styles.cardLabel} lightColor="#666" darkColor="#999">
                Total Fee
              </ThemedText>
            </View>
            <ThemedText style={styles.cardValue} type="defaultSemiBold">
              {formatCurrency(feeSummary.total_fee)}
            </ThemedText>
          </ThemedCard>

          {/* Paid Amount Card */}
          <ThemedCard style={[styles.summaryCard, { backgroundColor: '#10b98110' }]} padding={16}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: '#10b98120' }]}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              </View>
              <ThemedText style={styles.cardLabel} lightColor="#666" darkColor="#999">
                Paid Amount
              </ThemedText>
            </View>
            <ThemedText style={styles.cardValue} type="defaultSemiBold" lightColor="#10b981" darkColor="#10b981">
              {formatCurrency(feeSummary.paid_amount)}
            </ThemedText>
          </ThemedCard>

          {/* Balance Due Card */}
          <ThemedCard style={[styles.summaryCard, { backgroundColor: '#ef444410' }]} padding={16}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: '#ef444420' }]}>
                <Ionicons name="alert-circle" size={24} color="#ef4444" />
              </View>
              <ThemedText style={styles.cardLabel} lightColor="#666" darkColor="#999">
                Balance Due
              </ThemedText>
            </View>
            <ThemedText style={styles.cardValue} type="defaultSemiBold" lightColor="#ef4444" darkColor="#ef4444">
              {formatCurrency(feeSummary.balance_due)}
            </ThemedText>
          </ThemedCard>
        </View>

        {/* Payment Progress */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle} type="subtitle">
            Payment Progress
          </ThemedText>
          <ThemedCard padding={16}>
            <View style={styles.progressInfo}>
              <ThemedText type="default" lightColor="#666" darkColor="#999">
                {feeSummary.status_percentage.toFixed(1)}% Paid
              </ThemedText>
              <ThemedText type="default" lightColor="#666" darkColor="#999">
                {formatCurrency(feeSummary.balance_due)} Remaining
              </ThemedText>
            </View>
            <ProgressBar percentage={feeSummary.status_percentage} />
          </ThemedCard>
        </View>

        {/* Next Due Date */}
        {feeSummary.next_due_date && (
          <View style={styles.section}>
            <ThemedCard style={[styles.nextDueCard, { backgroundColor: theme.colors.primary + '10' }]} padding={16}>
              <View style={styles.nextDueContent}>
                <Ionicons name="calendar" size={24} color={theme.colors.primary} />
                <View style={styles.nextDueText}>
                  <ThemedText type="default" lightColor="#666" darkColor="#999">
                    Next Due Date
                  </ThemedText>
                  <ThemedText type="defaultSemiBold" style={{ marginTop: 4 }}>
                    {new Date(feeSummary.next_due_date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </ThemedText>
                </View>
              </View>
            </ThemedCard>
          </View>
        )}
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
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardsContainer: {
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  nextDueCard: {
    borderRadius: 12,
    elevation: 2,
  },
  nextDueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nextDueText: {
    flex: 1,
  },
});
