/**
 * Parent Portal - Academic Dashboard
 * PHASE 4, EPIC_PARENT_ACADEMICS
 * 
 * Parents view student academic progress including marks, subjects, and performance trends
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
} from 'react-native';
import { ParentAcademicService } from '../../data/services/allPortalServices';

interface StudentMarks {
  studentId: string;
  studentName: string;
  class: string;
  academicYear: string;
  subjects: SubjectMarks[];
  gpa: number;
  performanceTrend: string;
}

interface SubjectMarks {
  subjectId: string;
  subjectName: string;
  marks: number;
  totalMarks: number;
  grade: string;
  percentage: number;
}

export default function ParentAcademicsScreen() {
  const [studentMarks, setStudentMarks] = useState<StudentMarks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-25');

  useEffect(() => {
    if (selectedStudent) {
      loadStudentMarks();
    }
  }, [selectedStudent, academicYear]);

  const loadStudentMarks = async () => {
    try {
      setLoading(true);
      const service = new ParentAcademicService();
      const marks = await service.getStudentMarks(selectedStudent, academicYear);
      setStudentMarks(marks);
      setError(null);
    } catch (err) {
      setError('Failed to load marks');
      Alert.alert('Error', 'Could not load student marks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Academic Progress</Text>
        <Text style={styles.subtitle}>View marks and performance trends</Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#0066cc" />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {studentMarks && (
        <View style={styles.content}>
          {/* GPA Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Overall Performance</Text>
            <View style={styles.gpaContainer}>
              <Text style={styles.gpaValue}>{studentMarks.gpa.toFixed(2)}</Text>
              <Text style={styles.gpaLabel}>GPA</Text>
            </View>
            <Text style={styles.trendText}>Trend: {studentMarks.performanceTrend}</Text>
          </View>

          {/* Subjects List */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Subject-wise Marks</Text>
            {studentMarks.subjects.map((subject) => (
              <View key={subject.subjectId} style={styles.subjectItem}>
                <Text style={styles.subjectName}>{subject.subjectName}</Text>
                <View style={styles.marksRow}>
                  <Text style={styles.marks}>
                    {subject.marks}/{subject.totalMarks}
                  </Text>
                  <Text style={styles.percentage}>({subject.percentage}%)</Text>
                  <Text style={[styles.grade, { color: getGradeColor(subject.grade) }]}>
                    {subject.grade}
                  </Text>
                </View>
                {/* Progress Bar */}
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${subject.percentage}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Class Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Class Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Class:</Text>
              <Text style={styles.value}>{studentMarks.class}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Academic Year:</Text>
              <Text style={styles.value}>{studentMarks.academicYear}</Text>
            </View>
          </View>

          {/* Download Report Button */}
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>📄 Download Report</Text>
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
    marginBottom: 15,
    color: '#333',
  },
  gpaContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  gpaValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  gpaLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  trendText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
  },
  subjectItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  marksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  marks: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  percentage: {
    fontSize: 12,
    color: '#666',
  },
  grade: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
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
  errorText: {
    color: '#f44336',
    fontSize: 14,
    padding: 15,
    textAlign: 'center',
  },
});
