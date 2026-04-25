/**
 * Parent Portal - Exam Results & Schedule
 * PHASE 4, EPIC_PARENT_EXAMS
 * 
 * Parents view exam schedules, results, and performance analytics for their children
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
import { ParentExamService } from '../../data/services/allPortalServices';

interface ExamSchedule {
  examId: string;
  examName: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  room: string;
  totalMarks: number;
}

interface ExamResult {
  resultId: string;
  examName: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  rank: string;
  resultDate: string;
}

interface ExamData {
  studentId: string;
  studentName: string;
  schedules: ExamSchedule[];
  results: ExamResult[];
  averagePercentage: number;
}

export default function ParentExamsScreen() {
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'schedule' | 'results'>('schedule');
  const [selectedStudent, setSelectedStudent] = useState('student_001');

  useEffect(() => {
    loadExamData();
  }, [selectedStudent]);

  const loadExamData = async () => {
    try {
      setLoading(true);
      const service = new ParentExamService();
      const schedule = await service.getExamSchedule(selectedStudent);
      const results = await service.getResults(selectedStudent);
      setExamData({
        studentId: selectedStudent,
        studentName: 'Raj Kumar',
        schedules: schedule,
        results: results,
        averagePercentage: 78.5,
      });
      setError(null);
    } catch (err) {
      setError('Failed to load exam data');
      Alert.alert('Error', 'Could not load exam information');
    } finally {
      setLoading(false);
    }
  };

  const renderScheduleItem = ({ item }: { item: ExamSchedule }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.examName}>{item.examName}</Text>
        <Text style={styles.subject}>{item.subject}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{item.date}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Time:</Text>
        <Text style={styles.value}>{item.time}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Room:</Text>
        <Text style={styles.value}>{item.room}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Duration:</Text>
        <Text style={styles.value}>{item.duration} mins</Text>
      </View>
      <TouchableOpacity style={styles.detailButton}>
        <Text style={styles.detailButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  const renderResultItem = ({ item }: { item: ExamResult }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.examName}>{item.examName}</Text>
        <Text style={[styles.grade, { color: getGradeColor(item.grade) }]}>
          {item.grade}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Subject:</Text>
        <Text style={styles.value}>{item.subject}</Text>
      </View>
      <View style={styles.marksContainer}>
        <View style={styles.marksPill}>
          <Text style={styles.marksValue}>{item.marksObtained}/{item.totalMarks}</Text>
          <Text style={styles.marksLabel}>Marks</Text>
        </View>
        <View style={styles.percentPill}>
          <Text style={styles.percentValue}>{item.percentage}%</Text>
          <Text style={styles.percentLabel}>Percentage</Text>
        </View>
        <View style={styles.rankPill}>
          <Text style={styles.rankValue}>{item.rank}</Text>
          <Text style={styles.rankLabel}>Class Rank</Text>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: \\%\ }]} />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Exam Portal</Text>
        <Text style={styles.subtitle}>View schedules and results</Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {examData && (
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Overall Performance</Text>
            <View style={styles.performanceContainer}>
              <Text style={styles.averagePercentage}>{examData.averagePercentage}%</Text>
              <Text style={styles.performanceLabel}>Average Percentage</Text>
            </View>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
              onPress={() => setActiveTab('schedule')}
            >
              <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>
                Schedule
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'results' && styles.activeTab]}
              onPress={() => setActiveTab('results')}
            >
              <Text style={[styles.tabText, activeTab === 'results' && styles.activeTabText]}>
                Results
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'schedule' && (
            <View>
              <Text style={styles.sectionTitle}>Upcoming Exams</Text>
              <FlatList
                data={examData.schedules}
                renderItem={renderScheduleItem}
                keyExtractor={(item) => item.examId}
                scrollEnabled={false}
              />
            </View>
          )}

          {activeTab === 'results' && (
            <View>
              <Text style={styles.sectionTitle}>Exam Results</Text>
              <FlatList
                data={examData.results}
                renderItem={renderResultItem}
                keyExtractor={(item) => item.resultId}
                scrollEnabled={false}
              />
            </View>
          )}

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Download Report Card</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function getGradeColor(grade: string): string {
  const colors: { [key: string]: string } = {
    'A+': '#4caf50',
    'A': '#8bc34a',
    'B': '#ffc107',
    'C': '#ff9800',
    'D': '#f44336',
    'F': '#9c27b0',
  };
  return colors[grade] || '#666';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#0066cc', padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#e3f2fd', marginTop: 5 },
  content: { padding: 15 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15, color: '#333' },
  examName: { fontSize: 16, fontWeight: '600', color: '#0066cc' },
  subject: { fontSize: 12, color: '#999', fontStyle: 'italic' },
  grade: { fontSize: 18, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  label: { fontSize: 12, color: '#666', fontWeight: '500' },
  value: { fontSize: 12, color: '#333', fontWeight: '600' },
  marksContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 15 },
  marksPill: { backgroundColor: '#e3f2fd', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  marksValue: { fontSize: 14, fontWeight: 'bold', color: '#0066cc' },
  marksLabel: { fontSize: 10, color: '#0066cc', marginTop: 4 },
  percentPill: { backgroundColor: '#f3e5f5', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  percentValue: { fontSize: 14, fontWeight: 'bold', color: '#9c27b0' },
  percentLabel: { fontSize: 10, color: '#9c27b0', marginTop: 4 },
  rankPill: { backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  rankValue: { fontSize: 14, fontWeight: 'bold', color: '#4caf50' },
  rankLabel: { fontSize: 10, color: '#4caf50', marginTop: 4 },
  progressBar: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#4caf50' },
  performanceContainer: { alignItems: 'center', paddingVertical: 15 },
  averagePercentage: { fontSize: 48, fontWeight: 'bold', color: '#0066cc' },
  performanceLabel: { fontSize: 12, color: '#666', marginTop: 5 },
  tabContainer: { flexDirection: 'row', marginBottom: 15, gap: 10 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#ddd' },
  activeTab: { borderBottomColor: '#0066cc' },
  tabText: { fontSize: 12, color: '#666', fontWeight: '500' },
  activeTabText: { color: '#0066cc', fontWeight: '700' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10 },
  detailButton: { marginTop: 10, paddingVertical: 8, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee' },
  detailButtonText: { color: '#0066cc', fontSize: 12, fontWeight: '600' },
  actionButton: { backgroundColor: '#0066cc', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 20 },
  actionButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  loader: { marginVertical: 30 },
  errorText: { color: '#f44336', fontSize: 14, padding: 15, textAlign: 'center' },
});
