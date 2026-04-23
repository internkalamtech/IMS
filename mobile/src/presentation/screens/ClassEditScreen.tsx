"""
mobile/src/presentation/screens/ClassEditScreen.tsx
STORY_CLASS_UPDATE_API - Class Edit/Update Screen
"""

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import classService from '../../data/services/classService';

interface ClassEditScreenProps {
  classId: string;
  onClose: () => void;
  onSave: () => void;
}

export const ClassEditScreen: React.FC<ClassEditScreenProps> = ({ classId, onClose, onSave }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [classTeacherId, setClassTeacherId] = useState('');
  const [maxStudents, setMaxStudents] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadClassData();
  }, [classId]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      const classData = await classService.getClass(classId);
      setName(classData.name);
      setSection(classData.section);
      setSectionName(classData.sectionName || '');
      setClassTeacherId(classData.classTeacherId || '');
      setMaxStudents(classData.maxStudents?.toString() || '');
    } catch (error) {
      Alert.alert('Error', 'Failed to load class data');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Class name is required';
    if (!section.trim()) newErrors.section = 'Section is required';
    if (maxStudents && isNaN(parseInt(maxStudents))) newErrors.maxStudents = 'Must be a number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      await classService.updateClass(classId, {
        name,
        section,
        sectionName: sectionName || undefined,
        classTeacherId: classTeacherId || undefined,
        maxStudents: maxStudents ? parseInt(maxStudents) : undefined,
      });
      Alert.alert('Success', 'Class updated successfully');
      onSave();
      onClose();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Class</Text>
      </View>

      <View style={styles.form}>
        {/* Class Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Class Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="e.g., Class 10"
            value={name}
            onChangeText={setName}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Section */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Section *</Text>
          <TextInput
            style={[styles.input, errors.section && styles.inputError]}
            placeholder="e.g., A, B, C"
            value={section}
            onChangeText={setSection}
          />
          {errors.section && <Text style={styles.errorText}>{errors.section}</Text>}
        </View>

        {/* Section Name (Optional) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Section Specialization</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Science, Commerce"
            value={sectionName}
            onChangeText={setSectionName}
          />
        </View>

        {/* Class Teacher ID (Optional) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Class Teacher ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Teacher ID"
            value={classTeacherId}
            onChangeText={setClassTeacherId}
          />
        </View>

        {/* Max Students (Optional) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Max Students</Text>
          <TextInput
            style={[styles.input, errors.maxStudents && styles.inputError]}
            placeholder="e.g., 50"
            value={maxStudents}
            onChangeText={setMaxStudents}
            keyboardType="number-pad"
          />
          {errors.maxStudents && <Text style={styles.errorText}>{errors.maxStudents}</Text>}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelBtn]}
            onPress={onClose}
            disabled={saving}
          >
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveBtn]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.btnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  inputError: {
    borderColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 4,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#e0e0e0',
  },
  saveBtn: {
    backgroundColor: '#2196F3',
  },
  btnText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
  },
});

export default ClassEditScreen;
