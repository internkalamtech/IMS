import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  RefreshControl,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/core/theme/ThemeContext';
import { ThemedView } from '@/presentation/components/ThemedView';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { Ionicons } from '@expo/vector-icons';

interface Transaction {
  id: string;
  student_id: string;
  installment_id: string | null;
  amount: number;
  payment_mode: 'UPI' | 'Card' | 'Cash' | 'Check' | 'Online';
  transaction_ref: string;
  receipt_number: string;
  created_at: string;
  description?: string;
}

export function ReceiptsScreen() {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mockTransactions: Transaction[] = [
    {
      id: 'txn-001',
      student_id: 'std-123',
      installment_id: 'inst-001',
      amount: 25000,
      payment_mode: 'Online',
      transaction_ref: 'TXN20240410001',
      receipt_number: 'REC-A1B2C3D4',
      created_at: '2024-04-10T10:30:00',
      description: 'Tuition fee installment 1',
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

  const filteredTransactions = mockTransactions.filter(
    t =>
      t.receipt_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getPaymentModeIcon = (mode: string) => {
    switch (mode) {
      case 'UPI':
        return 'phone-portrait';
      case 'Card':
        return 'card';
      case 'Cash':
        return 'cash';
      case 'Check':
        return 'document';
      case 'Online':
      default:
        return 'globe';
    }
  };

  const handleViewReceipt = (transaction: Transaction) => {
    Alert.alert(
      'Receipt Details',
      `Receipt Number: ${transaction.receipt_number}\nAmount: ${formatCurrency(transaction.amount)}\nMode: ${transaction.payment_mode}\nRef: ${transaction.transaction_ref}`,
      [
        { text: 'Download', onPress: () => Alert.alert('PDF download would be initiated') },
        { text: 'Close', onPress: () => {} },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <ThemedText style={styles.headerTitle} type="title" color="primaryForeground">
            Payment Receipts
          </ThemedText>
          <ThemedText style={styles.headerSubtitle} color="primaryForeground">
            View and download transaction receipts
          </ThemedText>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Ionicons name="search" size={20} color={theme.colors.foreground + '80'} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.foreground }]}
              placeholder="Search by receipt or description..."
              placeholderTextColor={theme.colors.foreground + '80'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color={theme.colors.foreground + '40'} />
            <ThemedText type="default" style={styles.emptyText} lightColor="#999" darkColor="#666">
              {searchQuery ? 'No receipts found' : 'No payment receipts yet'}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {filteredTransactions.map((transaction, index) => (
              <ThemedCard
                key={index}
                style={styles.transactionCard}
                padding={12}
              >
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionLeft}>
                    <View
                      style={[
                        styles.paymentIcon,
                        { backgroundColor: theme.colors.primary + '20' },
                      ]}
                    >
                      <Ionicons
                        name={getPaymentModeIcon(transaction.payment_mode)}
                        size={20}
                        color={theme.colors.primary}
                      />
                    </View>
                    <View style={styles.transactionInfo}>
                      <ThemedText type="defaultSemiBold" style={styles.receiptNumber}>
                        {transaction.receipt_number}
                      </ThemedText>
                      <ThemedText type="default" lightColor="#666" darkColor="#999" style={styles.transactionMode}>
                        {transaction.payment_mode}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <ThemedText type="defaultSemiBold" style={styles.transactionAmount}>
                      {formatCurrency(transaction.amount)}
                    </ThemedText>
                    <ThemedText type="default" lightColor="#666" darkColor="#999" style={styles.transactionDate}>
                      {new Date(transaction.created_at).toLocaleDateString('en-IN')}
                    </ThemedText>
                  </View>
                </View>

                {transaction.description && (
                  <View style={styles.descriptionContainer}>
                    <ThemedText type="default" lightColor="#666" darkColor="#999" style={styles.description}>
                      {transaction.description}
                    </ThemedText>
                  </View>
                )}

                {/* Action Button */}
                <TouchableOpacity
                  style={[styles.downloadButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => handleViewReceipt(transaction)}
                >
                  <Ionicons name="download" size={16} color="#fff" />
                  <ThemedText style={styles.downloadButtonText} color="primaryForeground">
                    View & Download
                  </ThemedText>
                </TouchableOpacity>
              </ThemedCard>
            ))}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
  },
  transactionsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  transactionCard: {
    borderRadius: 12,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  receiptNumber: {
    fontSize: 14,
  },
  transactionMode: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  descriptionContainer: {
    marginBottom: 12,
  },
  description: {
    fontSize: 12,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  downloadButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
