/**
 * Teacher Portal - Assessment & Quiz Creation
 * PHASE 6, EPIC_TEACHER_ASSESSMENT
 * 
 * Teachers create assignments, quizzes, and manage assessments
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
import { TeacherAssessmentService } from '../../data/services/allPortalServices';

interface Question {
  questionId: string;
  question: string;
  type: 'mcq' | 'short' | 'essay';
  options?: string[];
}

interface TestData {
  teacherId: string;
  questions: Question[];
}

export default function TeacherAssessmentScreen() {
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testName, setTestName] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadTestData();
  }, []);

  const loadTestData = async () => {
    try {
      setLoading(true);
      const service = new TeacherAssessmentService();
      const data = await service.getQuestionBank('teacher_001');
      setTestData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load assessment data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async () => {
    try {
      if (!testName.trim()) {
        Alert.alert('Error', 'Please enter test name');
        return;
      }
      
      const service = new TeacherAssessmentService();
      await service.createTest({
        name: testName,
        questions: questions,
      });
      Alert.alert('Success', 'Test created successfully');
      setTestName('');
      setQuestions([]);
      setShowForm(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to create test');
    }
  };

  const renderQuestionItem = ({ item }: { item: Question }) => (
    <View style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionType}>{item.type.toUpperCase()}</Text>
      </View>
      <Text style={styles.questionText}>{item.question}</Text>
      {item.options && (
        <View style={styles.optionsContainer}>
          {item.options.map((option, index) => (
            <Text key={index} style={styles.option}>
              {String.fromCharCode(65 + index)}) {option}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Assessment Creator</Text>
        <Text style={styles.subtitle}>Create tests and quizzes</Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {!showForm && (
        <View style={styles.content}>
          <TouchableOpacity style={styles.createButton} onPress={() => setShowForm(true)}>
            <Text style={styles.createButtonText}>Create New Test</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Question Bank</Text>
          {testData?.questions && testData.questions.length > 0 ? (
            <FlatList
              data={testData.questions}
              renderItem={renderQuestionItem}
              keyExtractor={(item) => item.questionId}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No questions yet</Text>
            </View>
          )}
        </View>
      )}

      {showForm && (
        <View style={styles.content}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Create New Test</Text>
            
            <Text style={styles.label}>Test Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter test name"
              value={testName}
              onChangeText={setTestName}
            />

            <Text style={styles.label}>Questions</Text>
            <Text style={styles.helperText}>Total questions available: {testData?.questions.length || 0}</Text>

            <TouchableOpacity style={styles.actionButton} onPress={handleCreateTest}>
              <Text style={styles.actionButtonText}>Create Test</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#999' }]} 
              onPress={() => setShowForm(false)}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
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
  createButton: { backgroundColor: '#4caf50', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  createButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10 },
  questionCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 12, elevation: 1, borderLeftWidth: 4, borderLeftColor: '#0066cc' },
  questionHeader: { marginBottom: 10 },
  questionType: { fontSize: 10, fontWeight: 'bold', color: '#0066cc', backgroundColor: '#e3f2fd', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start' },
  questionText: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10, lineHeight: 20 },
  optionsContainer: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 6 },
  option: { fontSize: 12, color: '#666', marginBottom: 6 },
  emptyContainer: { backgroundColor: '#fff', padding: 30, borderRadius: 10, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#999' },
  formCard: { backgroundColor: '#fff', borderRadius: 10, padding: 20, elevation: 2 },
  formTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15, color: '#333' },
  label: { fontSize: 12, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 14, color: '#333' },
  helperText: { fontSize: 11, color: '#999', marginBottom: 15 },
  actionButton: { backgroundColor: '#0066cc', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  actionButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  loader: { marginVertical: 30 },
  errorText: { color: '#f44336', fontSize: 14, padding: 15, textAlign: 'center' },
});
