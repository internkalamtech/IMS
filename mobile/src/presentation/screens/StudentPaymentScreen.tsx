/**
 * StudentPaymentScreen.tsx
 * STORY_STUDENT_FEE_CRUD - Student Payment & Ledger Management (Frontend)
 * 
 * Admin interface for recording payments, viewing payment history, and updating payment status
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Picker,
  ActivityIndicator,
} from 'react-native';

interface StudentPayment {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  className: string;
  totalFeeAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'Paid' | 'Partial' | 'Overdue';
  nextDueDate: string;
  paymentHistory: Payment[];
}

interface Payment {
  id: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Cheque' | 'Bank Transfer';
  receiptNumber: string;
  paidDate: string;
  referenceNumber?: string;
  notes?: string;
}

export const StudentPaymentScreen: React.FC = () => {
  const [studentPayments, setStudentPayments] = useState<StudentPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<StudentPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentPayment | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMode: 'Cash',
    referenceNumber: '',
    notes: '',
  });

  /**
   * Fetch all student payment records
   */
  useEffect(() => {
    fetchStudentPayments();
  }, []);

  /**
   * Apply filters when search or status filter changes
   */
  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterStatus, studentPayments]);

  const fetchStudentPayments = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await studentPaymentService.list();
      // setStudentPayments(response.data);
      console.log('Fetching student payments...');
    } catch (error) {
      Alert.alert('Error', 'Failed to load student payments');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Apply search and filter logic
   */
  const applyFilters = () => {
    let filtered = studentPayments;

    // Search by name, roll number, or class
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.studentName.toLowerCase().includes(query) ||
          payment.rollNumber.toLowerCase().includes(query) ||
          payment.className.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filterStatus !== 'All') {
      filtered = filtered.filter((payment) => payment.status === filterStatus);
    }

    setFilteredPayments(filtered);
  };

  /**
   * Record a new payment for selected student
   */
  const handleRecordPayment = async () => {
    if (!selectedStudent || !paymentForm.amount) {
      Alert.alert('Validation Error', 'Please enter a payment amount');
      return;
    }

    const paymentAmount = parseFloat(paymentForm.amount);
    if (paymentAmount <= 0 || paymentAmount > selectedStudent.pendingAmount) {
      Alert.alert('Validation Error', `Payment must be between 0 and ₹${selectedStudent.pendingAmount}`);
      return;
    }

    try {
      // TODO: Replace with actual API call
      // await studentPaymentService.recordPayment(selectedStudent.id, paymentForm);
      
      Alert.alert('Success', `Payment of ₹${paymentAmount} recorded successfully`);
      resetPaymentForm();
      setDetailModalVisible(false);
      fetchStudentPayments();
    } catch (error) {
      Alert.alert('Error', 'Failed to record payment');
    }
  };

  /**
   * Reset payment form
   */
  const resetPaymentForm = () => {
    setPaymentForm({
      amount: '',
      paymentMode: 'Cash',
      referenceNumber: '',
      notes: '',
    });
  };

  /**
   * Open student detail view
   */
  const handleViewStudentDetail = (student: StudentPayment) => {
    setSelectedStudent(student);
    setDetailModalVisible(true);
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return '#4CAF50';
      case 'Partial':
        return '#FF9800';
      case 'Overdue':
        return '#f44336';
      default:
        return '#999';
    }
  };

  const renderPaymentItem = ({ item }: { item: StudentPayment }) => (
    <TouchableOpacity
      style={styles.paymentCard}
      onPress={() => handleViewStudentDetail(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.studentName}</Text>
          <Text style={styles.rollNumber}>Roll: {item.rollNumber}</Text>
          <Text style={styles.className}>{item.className}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.amountRow}>
          <Text style={styles.label}>Total Fee:</Text>
          <Text style={styles.amount}>₹{item.totalFeeAmount}</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.label}>Paid:</Text>
          <Text style={[styles.amount, { color: '#4CAF50' }]}>₹{item.paidAmount}</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.label}>Pending:</Text>
          <Text style={[styles.amount, { color: '#f44336' }]}>₹{item.pendingAmount}</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(item.paidAmount / item.totalFeeAmount) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.nextDue}>Next Due: {item.nextDueDate}</Text>
      </View>

      <TouchableOpacity
        style={styles.payButton}
        onPress={() => handleViewStudentDetail(item)}
      >
        <Text style={styles.payButtonText}>Record Payment →</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPaymentHistory = ({ item }: { item: Payment }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyLeft}>
        <Text style={styles.historyDate}>{item.paidDate}</Text>
        <Text style={styles.historyReceipt}>{item.receiptNumber}</Text>
      </View>
      <View style={styles.historyMiddle}>
        <Text style={styles.historyMode}>{item.paymentMode}</Text>
        {item.referenceNumber && (
          <Text style={styles.historyRef}>Ref: {item.referenceNumber}</Text>
        )}
      </View>
      <Text style={styles.historyAmount}>₹{item.amount}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with search */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Payments</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, roll, or class..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter tabs */}
      <View style={styles.filterContainer}>
        {['All', 'Paid', 'Partial', 'Overdue'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filterStatus === status && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === status && styles.filterButtonTextActive,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Student list */}
      {filteredPayments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No student payments found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPayments}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          scrollEnabled={false}
        />
      )}

      {/* Student Detail Modal */}
      <Modal visible={detailModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.detailModal}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>
                {selectedStudent?.studentName}
              </Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailContent}>
              {/* Student Summary */}
              <View style={styles.summaryCard}>
                <Text style={styles.sectionTitle}>Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Roll Number:</Text>
                  <Text style={styles.summaryValue}>
                    {selectedStudent?.rollNumber}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Class:</Text>
                  <Text style={styles.summaryValue}>{selectedStudent?.className}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Fee:</Text>
                  <Text style={[styles.summaryValue, { color: '#4CAF50', fontWeight: 'bold' }]}>
                    ₹{selectedStudent?.totalFeeAmount}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Paid Amount:</Text>
                  <Text style={styles.summaryValue}>₹{selectedStudent?.paidAmount}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Pending:</Text>
                  <Text style={[styles.summaryValue, { color: '#f44336', fontWeight: 'bold' }]}>
                    ₹{selectedStudent?.pendingAmount}
                  </Text>
                </View>
              </View>

              {/* Record Payment Section */}
              <View style={styles.paymentFormCard}>
                <Text style={styles.sectionTitle}>Record Payment</Text>

                <Text style={styles.label}>Amount (Max: ₹{selectedStudent?.pendingAmount})</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter amount"
                  keyboardType="decimal-pad"
                  value={paymentForm.amount}
                  onChangeText={(text) =>
                    setPaymentForm({ ...paymentForm, amount: text })
                  }
                />

                <Text style={styles.label}>Payment Mode</Text>
                <Picker
                  selectedValue={paymentForm.paymentMode}
                  style={styles.picker}
                  onValueChange={(value) =>
                    setPaymentForm({ ...paymentForm, paymentMode: value })
                  }
                >
                  <Picker.Item label="Cash" value="Cash" />
                  <Picker.Item label="UPI" value="UPI" />
                  <Picker.Item label="Card" value="Card" />
                  <Picker.Item label="Cheque" value="Cheque" />
                  <Picker.Item label="Bank Transfer" value="Bank Transfer" />
                </Picker>

                <Text style={styles.label}>Reference Number (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Transaction ID, Cheque Number"
                  value={paymentForm.referenceNumber}
                  onChangeText={(text) =>
                    setPaymentForm({ ...paymentForm, referenceNumber: text })
                  }
                />

                <Text style={styles.label}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Additional notes"
                  multiline
                  numberOfLines={3}
                  value={paymentForm.notes}
                  onChangeText={(text) =>
                    setPaymentForm({ ...paymentForm, notes: text })
                  }
                />

                <TouchableOpacity
                  style={styles.recordButton}
                  onPress={handleRecordPayment}
                >
                  <Text style={styles.recordButtonText}>Record Payment</Text>
                </TouchableOpacity>
              </View>

              {/* Payment History */}
              {selectedStudent && selectedStudent.paymentHistory.length > 0 && (
                <View style={styles.historyCard}>
                  <Text style={styles.sectionTitle}>Payment History</Text>
                  {selectedStudent.paymentHistory.map((payment) => (
                    <View key={payment.id}>
                      {renderPaymentHistory({ item: payment })}
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  list: {
    flex: 1,
    padding: 8,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  rollNumber: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  className: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  amount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginTop: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  nextDue: {
    fontSize: 12,
    color: '#999',
  },
  payButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  detailModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '95%',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
  },
  detailContent: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  paymentFormCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 10,
    minHeight: 80,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 12,
  },
  recordButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  recordButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyLeft: {
    flex: 1,
  },
  historyDate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  historyReceipt: {
    fontSize: 11,
    color: '#2196F3',
    marginTop: 2,
  },
  historyMiddle: {
    flex: 1,
    marginHorizontal: 8,
  },
  historyMode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  historyRef: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  historyAmount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4CAF50',
    minWidth: 60,
    textAlign: 'right',
  },
});
