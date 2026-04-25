/**
 * Parent Portal - Attendance Tracker
 * PHASE 4, EPIC_PARENT_ATTENDANCE
 * 
 * Track student attendance with detailed daily records and absence patterns
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { ParentAttendanceService } from '../../data/services/allPortalServices';

interface AttendanceRecord {
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
  remarks?: string;
}

interface AttendanceSummary {
  studentId: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  attendancePercentage: number;
  records: AttendanceRecord[];
}

export default function ParentAttendanceScreen() {
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadAttendance();
  }, [month]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const service = new ParentAttendanceService();
      const data = await service.getStudentAttendance('', month);
      setAttendance(data);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      PRESENT: '#4caf50',
      ABSENT: '#f44336',
      LATE: '#ff9800',
      LEAVE: '#2196f3',
    };
    return colors[status] || '#999';
  };

  const getStatusIcon = (status: string): string => {
    const icons: { [key: string]: string } = {
      PRESENT: '✓',
      ABSENT: '✗',
      LATE: '⏱',
      LEAVE: '📋',
    };
    return icons[status] || '?';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance Tracker</Text>
        <Text style={styles.subtitle}>Monthly attendance overview</Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#0066cc" />}

      {attendance && (
        <View style={styles.content}>
          {/* Summary Cards */}
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{attendance.attendancePercentage}%</Text>
              <Text style={styles.summaryLabel}>Attendance</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: '#4caf50' }]}>
                {attendance.presentDays}
              </Text>
              <Text style={styles.summaryLabel}>Present</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: '#f44336' }]}>
                {attendance.absentDays}
              </Text>
              <Text style={styles.summaryLabel}>Absent</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: '#ff9800' }]}>
                {attendance.lateDays}
              </Text>
              <Text style={styles.summaryLabel}>Late</Text>
            </View>
          </View>

          {/* Attendance Progress */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Attendance Progress</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${attendance.attendancePercentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {attendance.presentDays} of {attendance.totalDays} days
            </Text>
          </View>

          {/* Daily Records */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Daily Records</Text>
            <FlatList
              scrollEnabled={false}
              data={attendance.records}
              keyExtractor={(item) => item.date}
              renderItem={({ item }) => (
                <View style={styles.recordItem}>
                  <Text style={styles.date}>{item.date}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(item.status) },
                    ]}
                  >
                    <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                  {item.remarks && (
                    <Text style={styles.remarks}>{item.remarks}</Text>
                  )}
                </View>
              )}
            />
          </View>

          {/* Leave Applications */}
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>📝 View Leave Applications</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0066cc',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#e3f2fd',
    marginTop: 5,
  },
  content: {
    padding: 15,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  recordItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  date: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  statusIcon: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  remarks: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
