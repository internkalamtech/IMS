/**
 * Teacher Portal - Leave Applications
 * PHASE 6, EPIC_TEACHER_LEAVE
 * 
 * Teachers apply for leave and view leave balance
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
  TextInput,
} from 'react-native';
import { TeacherLeaveService } from '../../data/services/allPortalServices';

interface LeaveRequest {
  leaveId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  type: 'casual' | 'medical' | 'earned';
}

interface LeaveBalance {
  teacherId: string;
  casualLeft: number;
  medicalLeft: number;
  earnedLeft: number;
  totalRequests: LeaveRequest[];
}

export default function TeacherLeaveScreen() {
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState('teacher_001');
  const [showForm, setShowForm] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState<'casual' | 'medical' | 'earned'>('casual');

  useEffect(() => {
    loadLeaveBalance();
  }, [teacherId]);

  const loadLeaveBalance = async () => {
    try {
      setLoading(true);
      const service = new TeacherLeaveService();
      const balance = await service.getLeaveBalance(teacherId, '2024');
      setLeaveBalance(balance);
      setError(null);
    } catch (err) {
      setError('Failed to load leave balance');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async () => {
    try {
      if (!fromDate || !toDate || !reason.trim()) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }

      const service = new TeacherLeaveService();
      await service.submitLeaveRequest({
        fromDate,
        toDate,
        reason,
        type: leaveType,
      });
      Alert.alert('Success', 'Leave request submitted');
      setFromDate('');
      setToDate('');
      setReason('');
      setShowForm(false);
      loadLeaveBalance();
    } catch (err) {
      Alert.alert('Error', 'Failed to submit leave request');
    }
  };

  const renderLeaveItem = ({ item }: { item: LeaveRequest }) => (
    <View style={styles.leaveCard}>
      <View style={styles.leaveHeader}>
        <Text style={styles.leaveType}>{item.type.toUpperCase()}</Text>
        <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
      <View style={styles.leaveDetails}>
        <View style={styles.dateRow}>
          <Text style={styles.label}>From: {item.fromDate}</Text>
          <Text style={styles.label}>To: {item.toDate}</Text>
        </View>
        <Text style={styles.reason}>Reason: {item.reason}</Text>
      </View>
    </View>
  );

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved':
        return '#4caf50';
      case 'pending':
        return '#ffc107';
      case 'rejected':
        return '#f44336';
      default:
        return '#999';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leave Management</Text>
        <Text style={styles.subtitle}>Apply for leave</Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {leaveBalance && (
        <View style={styles.content}>
          {!showForm && (
            <>
              <View style={styles.balanceCard}>
                <Text style={styles.cardTitle}>Leave Balance</Text>
                <View style={styles.balanceRow}>
                  <View style={styles.balanceItem}>
                    <Text style={styles.balanceLabel}>Casual</Text>
                    <Text style={styles.balanceValue}>{leaveBalance.casualLeft}</Text>
                  </View>
                  <View style={styles.balanceItem}>
                    <Text style={styles.balanceLabel}>Medical</Text>
                    <Text style={styles.balanceValue}>{leaveBalance.medicalLeft}</Text>
                  </View>
                  <View style={styles.balanceItem}>
                    <Text style={styles.balanceLabel}>Earned</Text>
                    <Text style={styles.balanceValue}>{leaveBalance.earnedLeft}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.applyButton} onPress={() => setShowForm(true)}>
                <Text style={styles.applyButtonText}>Apply for Leave</Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Leave History</Text>
              <FlatList
                data={leaveBalance.totalRequests}
                renderItem={renderLeaveItem}
                keyExtractor={(item) => item.leaveId}
                scrollEnabled={false}
              />
            </>
          )}

          {showForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Apply for Leave</Text>
              
              <Text style={styles.label}>Leave Type</Text>
              <View style={styles.typeSelector}>
                {['casual', 'medical', 'earned'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeButton, leaveType === type && styles.selectedType]}
                    onPress={() => setLeaveType(type as any)}
                  >
                    <Text style={[styles.typeButtonText, leaveType === type && styles.selectedTypeText]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>From Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={fromDate}
                onChangeText={setFromDate}
              />

              <Text style={styles.label}>To Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={toDate}
                onChangeText={setToDate}
              />

              <Text style={styles.label}>Reason</Text>
              <TextInput
                style={[styles.input, { minHeight: 80 }]}
                placeholder="Enter reason for leave"
                value={reason}
                onChangeText={setReason}
                multiline
              />

              <TouchableOpacity style={styles.actionButton} onPress={handleApplyLeave}>
                <Text style={styles.actionButtonText}>Submit Request</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#999' }]}
                onPress={() => setShowForm(false)}
              >
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
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
  balanceCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15, color: '#333' },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-around' },
  balanceItem: { alignItems: 'center' },
  balanceLabel: { fontSize: 11, color: '#666', marginBottom: 5 },
  balanceValue: { fontSize: 24, fontWeight: 'bold', color: '#0066cc' },
  applyButton: { backgroundColor: '#4caf50', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  applyButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10 },
  leaveCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 12, elevation: 1 },
  leaveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  leaveType: { fontSize: 12, fontWeight: 'bold', color: '#0066cc' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 10, fontWeight: 'bold', color: '#fff' },
  leaveDetails: { marginTop: 10 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 11, color: '#666', fontWeight: '500' },
  reason: { fontSize: 12, color: '#333', marginTop: 8 },
  formCard: { backgroundColor: '#fff', borderRadius: 10, padding: 20, elevation: 2 },
  formTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15, color: '#333' },
  typeSelector: { flexDirection: 'row', marginBottom: 15, gap: 8 },
  typeButton: { flex: 1, paddingVertical: 10, borderRadius: 6, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  selectedType: { backgroundColor: '#0066cc', borderColor: '#0066cc' },
  typeButtonText: { fontSize: 12, fontWeight: '600', color: '#666' },
  selectedTypeText: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 14, color: '#333' },
  actionButton: { backgroundColor: '#0066cc', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  actionButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  loader: { marginVertical: 30 },
  errorText: { color: '#f44336', fontSize: 14, padding: 15, textAlign: 'center' },
});
