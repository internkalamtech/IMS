/**
 * Teacher Portal - Academics & Class Management
 * PHASE 6, EPIC_TEACHER_ACADEMICS
 * 
 * Teachers manage class list, enter marks, and create assignments
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
import { TeacherAcademicService } from '../../data/services/allPortalServices';

interface Student {
  studentId: string;
  studentName: string;
  rollNumber: string;
  marks?: number;
}

interface ClassData {
  classId: string;
  className: string;
  totalStudents: number;
  students: Student[];
}

export default function TeacherAcademicsScreen() {
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState('class_001');
  const [marksInput, setMarksInput] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadClassData();
  }, [selectedClass]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      const service = new TeacherAcademicService();
      const data = await service.getClassList(selectedClass);
      setClassData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load class data');
      Alert.alert('Error', 'Could not load class information');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMarks = async () => {
    try {
      const marksArray = Object.entries(marksInput).map(([studentId, marks]) => ({
        studentId,
        marks: parseInt(marks),
      }));
      
      const service = new TeacherAcademicService();
      await service.bulkEnterMarks(selectedClass, marksArray);
      Alert.alert('Success', 'Marks saved successfully');
      setMarksInput({});
    } catch (err) {
      Alert.alert('Error', 'Failed to save marks');
    }
  };

  const renderStudentItem = ({ item }: { item: Student }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.studentName}</Text>
        <Text style={styles.rollNumber}>Roll No: {item.rollNumber}</Text>
      </View>
      <TextInput
        style={styles.marksInput}
        placeholder="Marks"
        keyboardType="number-pad"
        maxLength={3}
        value={marksInput[item.studentId] || ''}
        onChangeText={(text) => setMarksInput({ ...marksInput, [item.studentId]: text })}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Class Management</Text>
        <Text style={styles.subtitle}>Manage marks and students</Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {classData && (
        <View style={styles.content}>
          <View style={styles.classCard}>
            <Text style={styles.cardTitle}>Class Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Class:</Text>
              <Text style={styles.value}>{classData.className}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Total Students:</Text>
              <Text style={styles.value}>{classData.totalStudents}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Enter Marks</Text>
          <FlatList
            data={classData.students}
            renderItem={renderStudentItem}
            keyExtractor={(item) => item.studentId}
            scrollEnabled={false}
          />

          <TouchableOpacity style={styles.actionButton} onPress={handleSaveMarks}>
            <Text style={styles.actionButtonText}>Save Marks</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { marginBottom: 30, backgroundColor: '#666' }]}>
            <Text style={styles.actionButtonText}>Create Assignment</Text>
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
  classCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15, color: '#333' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  label: { fontSize: 12, color: '#666', fontWeight: '500' },
  value: { fontSize: 12, color: '#333', fontWeight: '600' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10 },
  studentCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 12, elevation: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 14, fontWeight: '600', color: '#0066cc', marginBottom: 4 },
  rollNumber: { fontSize: 11, color: '#999' },
  marksInput: { width: 60, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#333' },
  actionButton: { backgroundColor: '#0066cc', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  actionButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  loader: { marginVertical: 30 },
  errorText: { color: '#f44336', fontSize: 14, padding: 15, textAlign: 'center' },
});
