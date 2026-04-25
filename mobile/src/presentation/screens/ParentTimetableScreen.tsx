/**
 * Parent Portal - Class Timetable View
 * PHASE 4, EPIC_PARENT_TIMETABLE
 * 
 * Parents view class schedules and timetables for their children
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
import { ParentTimetableService } from '../../data/services/allPortalServices';

interface ClassSession {
  sessionId: string;
  subject: string;
  teacher: string;
  day: string;
  startTime: string;
  endTime: string;
  classroom: string;
}

interface TimetableData {
  studentId: string;
  studentName: string;
  class: string;
  sessions: ClassSession[];
}

export default function ParentTimetableScreen() {
  const [timetableData, setTimetableData] = useState<TimetableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState('student_001');
  const [selectedDay, setSelectedDay] = useState('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    loadTimetableData();
  }, [selectedStudent]);

  const loadTimetableData = async () => {
    try {
      setLoading(true);
      const service = new ParentTimetableService();
      const data = await service.getTimetable(selectedStudent);
      setTimetableData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load timetable');
      Alert.alert('Error', 'Could not load class schedule');
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = timetableData?.sessions.filter(s => s.day === selectedDay) || [];

  const renderSessionItem = ({ item }: { item: ClassSession }) => (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <Text style={styles.subject}>{item.subject}</Text>
        <Text style={styles.timeSlot}>{item.startTime} - {item.endTime}</Text>
      </View>
      <View style={styles.sessionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Teacher:</Text>
          <Text style={styles.detailValue}>{item.teacher}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Room:</Text>
          <Text style={styles.detailValue}>{item.classroom}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Class Timetable</Text>
        <Text style={styles.subtitle}>Weekly schedule view</Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {timetableData && (
        <View style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Class Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Student:</Text>
              <Text style={styles.value}>{timetableData.studentName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Class:</Text>
              <Text style={styles.value}>{timetableData.class}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Select Day</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroller}>
            {days.map(day => (
              <TouchableOpacity
                key={day}
                style={[styles.dayButton, selectedDay === day && styles.activeDayButton]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[styles.dayButtonText, selectedDay === day && styles.activeDayButtonText]}>
                  {day.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Classes on {selectedDay}</Text>
          {filteredSessions.length > 0 ? (
            <FlatList
              data={filteredSessions}
              renderItem={renderSessionItem}
              keyExtractor={(item) => item.sessionId}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No classes scheduled</Text>
            </View>
          )}

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Download Full Timetable</Text>
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
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  label: { fontSize: 12, color: '#666', fontWeight: '500' },
  value: { fontSize: 12, color: '#333', fontWeight: '600' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 15, marginBottom: 10 },
  dayScroller: { marginBottom: 15 },
  dayButton: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, marginRight: 8, borderWidth: 1, borderColor: '#ddd' },
  activeDayButton: { backgroundColor: '#0066cc', borderColor: '#0066cc' },
  dayButtonText: { fontSize: 12, fontWeight: '600', color: '#666' },
  activeDayButtonText: { color: '#fff' },
  sessionCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 12, elevation: 1, borderLeftWidth: 4, borderLeftColor: '#0066cc' },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  subject: { fontSize: 14, fontWeight: '600', color: '#0066cc' },
  timeSlot: { fontSize: 12, fontWeight: '600', color: '#999' },
  sessionDetails: { marginTop: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  detailLabel: { fontSize: 11, color: '#666', fontWeight: '500' },
  detailValue: { fontSize: 11, color: '#333', fontWeight: '600' },
  noDataContainer: { backgroundColor: '#fff', padding: 30, borderRadius: 10, alignItems: 'center' },
  noDataText: { fontSize: 14, color: '#999' },
  actionButton: { backgroundColor: '#0066cc', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 20, marginBottom: 30 },
  actionButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  loader: { marginVertical: 30 },
  errorText: { color: '#f44336', fontSize: 14, padding: 15, textAlign: 'center' },
});
