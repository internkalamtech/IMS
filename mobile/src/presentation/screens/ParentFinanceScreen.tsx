/**
 * Parent Portal - Finance & Payment Management
 * PHASE 4, EPIC_PARENT_FINANCE
 * 
 * Parents manage fee payments, view invoices, and track payment history
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { ParentFinanceService } from '../../data/services/allPortalServices';

interface Fee {
  feeId: string;
  feeType: string;
  amount: number;
  dueDate: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  paymentDate?: string;
}

interface FinanceData {
  studentId: string;
  studentName: string;
  totalDues: number;
  totalPaid: number;
  totalAmount: number;
  fees: Fee[];
}

export default function ParentFinanceScreen() {
  const [financeData, setFinanceData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState('student_001');

  useEffect(() => {
    loadFinanceData();
  }, [selectedStudent]);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      const service = new ParentFinanceService();
      const data = await service.getFinanceDetails(selectedStudent);
      setFinanceData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load finance data');
      Alert.alert('Error', 'Could not load payment information');
    } finally {
      setLoading(false);
    }
  };

  const renderFeeItem = ({ item }: { item: Fee }) => (
    <View style={styles.feeCard}>
      <View style={styles.feeHeader}>
        <Text style={styles.feeType}>{item.feeType}</Text>
        <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(item.paymentStatus) }]}>
          {item.paymentStatus.toUpperCase()}
        </Text>
      </View>
      <View style={styles.feeDetails}>
        <View style={styles.feeRow}>
          <Text style={styles.label}>Amount:</Text>
          <Text style={styles.amount}>Rs. {item.amount}</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.label}>Due Date:</Text>
          <Text style={styles.value}>{item.dueDate}</Text>
        </View>
        {item.paymentDate && (
          <View style={styles.feeRow}>
            <Text style={styles.label}>Paid On:</Text>
            <Text style={styles.value}>{item.paymentDate}</Text>
          </View>
        )}
      </View>
      {item.paymentStatus === 'pending' && (
        <TouchableOpacity style={styles.payButton}>
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'paid':
        return '#4caf50';
      case 'pending':
        return '#ffc107';
      case 'overdue':
        return '#f44336';
      default:
        return '#999';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Finance Portal</Text>
        <Text style={styles.subtitle}>Manage fees and payments</Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {financeData && (
        <View style={styles.content}>
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Payment Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Amount</Text>
                <Text style={styles.summaryValue}>Rs. {financeData.totalAmount}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Paid</Text>
                <Text style={[styles.summaryValue, { color: '#4caf50' }]}>Rs. {financeData.totalPaid}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Pending</Text>
                <Text style={[styles.summaryValue, { color: '#f44336' }]}>Rs. {financeData.totalDues}</Text>
              </View>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.cardTitle}>Payment Progress</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: \\%\ }]} />
            </View>
            <Text style={styles.progressText}>{Math.round((financeData.totalPaid / financeData.totalAmount) * 100)}% Completed</Text>
          </View>

          <Text style={styles.sectionTitle}>Fee Breakdown</Text>
          <FlatList
            data={financeData.fees}
            renderItem={renderFeeItem}
            keyExtractor={(item) => item.feeId}
            scrollEnabled={false}
          />

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Download Invoice</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { marginBottom: 30 }]}>
            <Text style={styles.actionButtonText}>View Payment History</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#0066cc', padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#e3f2fd', marginTop: 5 },
  content: { padding: 15 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 2 },
  progressContainer: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15, color: '#333' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryLabel: { fontSize: 12, color: '#666', marginBottom: 5 },
  summaryValue: { fontSize: 18, fontWeight: 'bold', color: '#0066cc' },
  progressBar: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: '100%', backgroundColor: '#4caf50' },
  progressText: { fontSize: 12, color: '#666', textAlign: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10 },
  feeCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 12, elevation: 1 },
  feeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  feeType: { fontSize: 14, fontWeight: '600', color: '#0066cc' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 10, fontWeight: 'bold', color: '#fff' },
  feeDetails: { marginBottom: 10 },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  label: { fontSize: 12, color: '#666', fontWeight: '500' },
  value: { fontSize: 12, color: '#333', fontWeight: '600' },
  amount: { fontSize: 14, fontWeight: 'bold', color: '#0066cc' },
  payButton: { backgroundColor: '#0066cc', padding: 8, borderRadius: 6, alignItems: 'center' },
  payButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  actionButton: { backgroundColor: '#0066cc', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  actionButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  loader: { marginVertical: 30 },
  errorText: { color: '#f44336', fontSize: 14, padding: 15, textAlign: 'center' },
});
