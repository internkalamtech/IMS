/**
 * Teacher Portal - Attendance Marking
 * PHASE 6, EPIC_TEACHER_ATTENDANCE
 * 
 * Teachers mark attendance and view attendance reports
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
import { TeacherAttendanceService } from '../../data/services/allPortalServices';

interface StudentAttendance {
  studentId: string;
  studentName: string;
  rollNumber: string;
  present: boolean;
}

interface AttendanceData {
  classId: string;
  className: string;
  date: string;
  students: StudentAttendance[];
  totalPresent: number;
  totalAbsent: number;
}

export default function TeacherAttendanceScreen() {
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState('class_001');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadAttendanceData();
  }, [selectedClass, selectedDate]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const service = new TeacherAttendanceService();
      const data = await service.getAttendanceSheet(selectedClass, selectedDate);
      setAttendanceData(data);
      const initialAttendance: { [key: string]: boolean } = {};
      data.students.forEach(student => {
        initialAttendance[student.studentId] = student.present;
      });
      setAttendance(initialAttendance);
      setError(null);
    } catch (err) {
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAttendance = async () => {
    try {
      const attendanceArray = Object.entries(attendance).map(([studentId, present]) => ({
        studentId,
        present,
        date: selectedDate,
      }));
      
      const service = new TeacherAttendanceService();
      await service.markAttendance(selectedClass, attendanceArray);
      Alert.alert('Success', 'Attendance saved successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to save attendance');
    }
  };

  const renderStudentItem = ({ item }: { item: StudentAttendance }) => (
    <TouchableOpacity
      style={[styles.studentCard, attendance[item.studentId] && styles.presentCard]}
      onPress={() => setAttendance({
        ...attendance,
        [item.studentId]: !attendance[item.studentId]
      })}
    >
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.studentName}</Text>
        <Text style={styles.rollNumber}>Roll No: {item.rollNumber}</Text>
      </View>
      <View style={[styles.statusIndicator, attendance[item.studentId] ? styles.presentIndicator : styles.absentIndicator]}>
        <Text style={styles.statusText}>
          {attendance[item.studentId] ? 'P' : 'A'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
        <Text style={styles.subtitle}>Mark student attendance</Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {attendanceData && (
        <View style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Attendance Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Date</Text>
                <Text style={styles.summaryValue}>{attendanceData.date}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Present</Text>
                <Text style={[styles.summaryValue, { color: '#4caf50' }]}>
                  {Object.values(attendance).filter(Boolean).length}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Absent</Text>
                <Text style={[styles.summaryValue, { color: '#f44336' }]}>
                  {Object.values(attendance).filter(v => !v).length}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Mark Attendance (Tap to toggle)</Text>
          <FlatList
            data={attendanceData.students}
            renderItem={renderStudentItem}
            keyExtractor={(item) => item.studentId}
            scrollEnabled={false}
          />

          <TouchableOpacity style={styles.actionButton} onPress={handleSaveAttendance}>
            <Text style={styles.actionButtonText}>Save Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { marginBottom: 30, backgroundColor: '#666' }]}>
            <Text style={styles.actionButtonText}>View Report</Text>
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
  infoCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15, color: '#333' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryLabel: { fontSize: 11, color: '#666', marginBottom: 5 },
  summaryValue: { fontSize: 18, fontWeight: 'bold', color: '#0066cc' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10 },
  studentCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 12, elevation: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  presentCard: { backgroundColor: '#f1f8f6' },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 14, fontWeight: '600', color: '#0066cc', marginBottom: 4 },
  rollNumber: { fontSize: 11, color: '#999' },
  statusIndicator: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  presentIndicator: { backgroundColor: '#4caf50' },
  absentIndicator: { backgroundColor: '#f44336' },
  statusText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  actionButton: { backgroundColor: '#0066cc', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  actionButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  loader: { marginVertical: 30 },
  errorText: { color: '#f44336', fontSize: 14, padding: 15, textAlign: 'center' },
});
