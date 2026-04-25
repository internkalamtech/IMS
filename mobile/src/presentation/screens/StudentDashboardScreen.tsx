/**
 * Student Portal - Dashboard
 * PHASE 5, EPIC_STUDENT_DASHBOARD
 * 
 * Student home page with assignments, marks, and announcements
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
import { StudentDashboardService } from '../../data/services/allPortalServices';

interface Assignment {
  assignmentId: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'submitted' | 'pending' | 'overdue';
  score?: number;
}

interface Announcement {
  announcementId: string;
  title: string;
  content: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

interface DashboardData {
  studentId: string;
  studentName: string;
  class: string;
  assignments: Assignment[];
  announcements: Announcement[];
  averageMarks: number;
  attendancePercentage: number;
}

export default function StudentDashboardScreen() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentId, setStudentId] = useState('student_001');

  useEffect(() => {
    loadDashboardData();
  }, [studentId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const service = new StudentDashboardService();
      const data = await service.getDashboardData(studentId);
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard');
      Alert.alert('Error', 'Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const renderAssignmentItem = ({ item }: { item: Assignment }) => (
    <View style={styles.assignmentCard}>
      <View style={styles.assignmentHeader}>
        <Text style={styles.assignmentTitle}>{item.title}</Text>
        <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
      <View style={styles.assignmentDetails}>
        <Text style={styles.subject}>{item.subject}</Text>
        <Text style={styles.dueDate}>Due: {item.dueDate}</Text>
        {item.score && <Text style={styles.score}>Score: {item.score}/100</Text>}
      </View>
      {item.status === 'pending' && (
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAnnouncementItem = ({ item }: { item: Announcement }) => (
    <View style={styles.announcementCard}>
      <View style={styles.announcementHeader}>
        <Text style={styles.announcementTitle}>{item.title}</Text>
        <Text style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          {item.priority}
        </Text>
      </View>
      <Text style={styles.announcementContent}>{item.content}</Text>
      <Text style={styles.announcementDate}>{item.date}</Text>
    </View>
  );

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'submitted':
        return '#4caf50';
      case 'pending':
        return '#ffc107';
      case 'overdue':
        return '#f44336';
      default:
        return '#999';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ffc107';
      case 'low':
        return '#4caf50';
      default:
        return '#999';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back</Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {dashboardData && (
        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Average Marks</Text>
              <Text style={styles.statValue}>{dashboardData.averageMarks}%</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Attendance</Text>
              <Text style={styles.statValue}>{dashboardData.attendancePercentage}%</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>My Assignments</Text>
          <FlatList
            data={dashboardData.assignments}
            renderItem={renderAssignmentItem}
            keyExtractor={(item) => item.assignmentId}
            scrollEnabled={false}
          />

          <Text style={styles.sectionTitle}>Announcements</Text>
          <FlatList
            data={dashboardData.announcements}
            renderItem={renderAnnouncementItem}
            keyExtractor={(item) => item.announcementId}
            scrollEnabled={false}
          />

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View All Assignments</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { marginBottom: 30 }]}>
            <Text style={styles.actionButtonText}>View Marks</Text>
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
  statsContainer: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 15, alignItems: 'center', elevation: 2 },
  statLabel: { fontSize: 12, color: '#666', marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#0066cc' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 15, marginBottom: 10 },
  assignmentCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 12, elevation: 1 },
  assignmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  assignmentTitle: { fontSize: 14, fontWeight: '600', color: '#0066cc', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 10, fontWeight: 'bold', color: '#fff' },
  assignmentDetails: { marginBottom: 10 },
  subject: { fontSize: 12, color: '#666', marginBottom: 4 },
  dueDate: { fontSize: 11, color: '#999' },
  score: { fontSize: 12, color: '#4caf50', fontWeight: '600', marginTop: 4 },
  submitButton: { backgroundColor: '#0066cc', padding: 8, borderRadius: 6, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  announcementCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 12, elevation: 1, borderLeftWidth: 4, borderLeftColor: '#0066cc' },
  announcementHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  announcementTitle: { fontSize: 13, fontWeight: '600', color: '#333', flex: 1 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 10, fontWeight: 'bold', color: '#fff' },
  announcementContent: { fontSize: 12, color: '#666', marginBottom: 8, lineHeight: 18 },
  announcementDate: { fontSize: 10, color: '#999' },
  actionButton: { backgroundColor: '#0066cc', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  actionButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  loader: { marginVertical: 30 },
  errorText: { color: '#f44336', fontSize: 14, padding: 15, textAlign: 'center' },
});
