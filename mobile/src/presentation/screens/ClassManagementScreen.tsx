"""
mobile/src/presentation/screens/ClassManagementScreen.tsx
STORY_CLASS_MGMT_UI - Comprehensive Class Management Dashboard
"""

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { ClassListScreen } from './ClassListScreen';
import { ClassEditScreen } from './ClassEditScreen';
import { ClassDeleteConfirmModal } from './ClassDeleteConfirmModal';

type ScreenMode = 'list' | 'edit' | 'create' | 'delete';

interface SelectedClass {
  id: string;
  name: string;
  studentCount: number;
}

export const ClassManagementScreen: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenMode>('list');
  const [selectedClass, setSelectedClass] = useState<SelectedClass | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateClass = () => {
    setCreateModalVisible(true);
  };

  const handleEditClass = (classId: string, className: string) => {
    setSelectedClass({ id: classId, name: className, studentCount: 0 });
    setCurrentScreen('edit');
  };

  const handleDeleteClass = (classId: string, className: string, studentCount: number) => {
    setSelectedClass({ id: classId, name: className, studentCount });
    setDeleteModalVisible(true);
  };

  const handleSaveSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setCurrentScreen('list');
  };

  const handleDeleteSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setDeleteModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Header with Navigation */}
      <View style={styles.header}>
        <Text style={styles.title}>Class Management</Text>
        {currentScreen === 'list' && (
          <TouchableOpacity style={styles.addBtn} onPress={handleCreateClass}>
            <Text style={styles.addBtnText}>+ New Class</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {currentScreen === 'list' && (
          <ClassListScreen
            key={refreshKey}
            onEdit={handleEditClass}
            onDelete={handleDeleteClass}
          />
        )}

        {currentScreen === 'edit' && selectedClass && (
          <Modal
            visible={true}
            animationType="slide"
            onRequestClose={() => setCurrentScreen('list')}
          >
            <ClassEditScreen
              classId={selectedClass.id}
              onClose={() => setCurrentScreen('list')}
              onSave={handleSaveSuccess}
            />
          </Modal>
        )}
      </View>

      {/* Delete Confirmation Modal */}
      {selectedClass && (
        <ClassDeleteConfirmModal
          visible={deleteModalVisible}
          classId={selectedClass.id}
          className={selectedClass.name}
          studentCount={selectedClass.studentCount}
          onClose={() => setDeleteModalVisible(false)}
          onConfirm={handleDeleteSuccess}
        />
      )}

      {/* Create Class Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.createModalContainer}>
          <View style={styles.createHeader}>
            <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
              <Text style={styles.closeBtn}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={styles.createTitle}>Create New Class</Text>
            <View style={{ width: 50 }} />
          </View>
          
          <ScrollView style={styles.createForm}>
            <Text style={styles.note}>
              Use the form below to create a new class. All fields marked with * are required.
            </Text>
            
            {/* Placeholder - in real implementation would show a form */}
            <View style={styles.formPlaceholder}>
              <Text style={styles.placeholderText}>Class creation form will appear here</Text>
              <Text style={styles.placeholderSmallText}>
                Connect ClassCreateScreen or inline form here
              </Text>
            </View>

            <TouchableOpacity
              style={styles.createSubmitBtn}
              onPress={() => {
                Alert.alert('Class Created', 'New class has been created successfully');
                setCreateModalVisible(false);
                handleSaveSuccess();
              }}
            >
              <Text style={styles.createSubmitBtnText}>Create Class</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2196F3',
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  addBtnText: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 13,
  },
  content: {
    flex: 1,
  },
  createModalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  createHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  createTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  createForm: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  note: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  formPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ddd',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  placeholderSmallText: {
    fontSize: 12,
    color: '#bbb',
  },
  createSubmitBtn: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 24,
  },
  createSubmitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ClassManagementScreen;
