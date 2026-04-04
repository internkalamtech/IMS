import React, { useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, StatusBar, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/core/theme/ThemeContext';
import { ThemedView } from '@/presentation/components/ThemedView';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { Ionicons } from '@expo/vector-icons';

interface Installment {
  id: string;
  fee_structure_id: string;
  student_id: string;
  due_date: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Overdue';
  paid_date?: string;
}

interface GroupedInstallments {
  title: string;
  data: Installment[];
}

export function FeeLedgerScreen() {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const mockInstallments: Installment[] = [
    {
      id: 'inst-001',
      fee_structure_id: 'fs-001',
      student_id: 'std-123',
      due_date: '2024-04-15',
      amount: 25000,
      status: 'Paid',
      paid_date: '2024-04-10',
    },
    {
      id: 'inst-002',
      fee_structure_id: 'fs-001',
      student_id: 'std-123',
      due_date: '2024-07-15',
      amount: 25000,
      status: 'Pending',
    },
    {
      id: 'inst-003',
      fee_structure_id: 'fs-002',
      student_id: 'std-123',
      due_date: '2024-05-01',
      amount: 15000,
      status: 'Pending',
    },
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // TODO: Fetch from API
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  }, []);

  const groupedData: GroupedInstallments[] = [
    {
      title: 'Tuition Fee',
      data: mockInstallments.filter(i => i.fee_structure_id === 'fs-001'),
    },
    {
      title: 'Transport Fee',
      data: mockInstallments.filter(i => i.fee_structure_id === 'fs-002'),
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return '#10b981';
      case 'Overdue':
        return '#ef4444';
      case 'Pending':
      default:
        return '#f59e0b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return '✓';
      case 'Overdue':
        return '!';
      case 'Pending':
      default:
        return '○';
    }
  };

  const renderInstallment = ({ item }: { item: Installment }) => (
    <ThemedCard style={styles.installmentCard} padding={12}>
      <View style={styles.installmentContent}>
        <View style={styles.installmentLeft}>
          <View
            style={[
              styles.statusIcon,
              { backgroundColor: getStatusColor(item.status) + '20' },
            ]}
          >
            <ThemedText style={{ color: getStatusColor(item.status) }}>
              {getStatusIcon(item.status)}
            </ThemedText>
          </View>
          <View style={styles.installmentInfo}>
            <ThemedText type="defaultSemiBold" style={styles.dueDate}>
              {new Date(item.due_date).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </ThemedText>
            <ThemedText
              type="default"
              lightColor="#666"
              darkColor="#999"
              style={styles.statusText}
            >
              {item.status}
              {item.paid_date && ` on ${new Date(item.paid_date).toLocaleDateString('en-IN')}`}
            </ThemedText>
          </View>
        </View>
        <View style={styles.installmentAmount}>
          <ThemedText type="defaultSemiBold" style={styles.amount}>
            {formatCurrency(item.amount)}
          </ThemedText>
        </View>
      </View>
    </ThemedCard>
  );

  const renderSectionHeader = ({ section: { title } }: { section: GroupedInstallments }) => (
    <View style={styles.sectionHeader}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        {title}
      </ThemedText>
    </View>
  );

  const renderSectionFooter = ({ section: { data } }: { section: GroupedInstallments }) => {
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    return (
      <View style={[styles.sectionFooter, { borderTopColor: theme.colors.border }]}>
        <ThemedText type="default" lightColor="#666" darkColor="#999">
          Subtotal:
        </ThemedText>
        <ThemedText type="defaultSemiBold">{formatCurrency(total)}</ThemedText>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <ThemedText style={styles.headerTitle} type="title" color="primaryForeground">
            Fee Ledger & Installments
          </ThemedText>
          <ThemedText style={styles.headerSubtitle} color="primaryForeground">
            Detailed breakdown of all fee installments
          </ThemedText>
        </View>
      </SafeAreaView>

      <SectionList
        sections={groupedData}
        keyExtractor={(item, index) => item.id + index}
        renderItem={renderInstallment}
        renderSectionHeader={renderSectionHeader}
        renderSectionFooter={renderSectionFooter}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    width: '100%',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  installmentCard: {
    marginBottom: 8,
    borderRadius: 8,
  },
  installmentContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  installmentLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  installmentInfo: {
    flex: 1,
  },
  dueDate: {
    fontSize: 14,
  },
  statusText: {
    fontSize: 12,
    marginTop: 2,
  },
  installmentAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    color: '#1f2937',
  },
  sectionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginBottom: 16,
    borderTopWidth: 1,
  },
});
