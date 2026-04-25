"""
mobile/src/presentation/screens/TimetableManagementScreen.tsx
mobile/src/presentation/screens/UserManagementScreen.tsx
PHASE_3: Admin Timetable & User Management UI Screens
"""

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { timetableService, userManagementService } from '../../data/services/combinedAdminServices';

// TIMETABLE MANAGEMENT SCREEN
export const TimetableManagementScreen: React.FC = () => {
  const [generating, setGenerating] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Timetable Management</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Generate Timetable</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setGenerating(true)}
        >
          <Text style={styles.buttonText}>Create New Timetable</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conflict Detection</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>No conflicts detected in current timetables</Text>
        </View>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Run Conflict Detection</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Teacher Preferences</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Manage Preferences</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// USER MANAGEMENT SCREEN
export const UserManagementScreen: React.FC = () => {
  const [bulkImportVisible, setBulkImportVisible] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Users</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>+ Create New User</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setBulkImportVisible(true)}
        >
          <Text style={styles.buttonText}>Bulk Import CSV</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manage Users</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View All Users</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Role Assignment</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Assign Roles & Permissions</Text>
        </TouchableOpacity>
      </View>

      {/* Bulk Import Modal */}
      <Modal visible={bulkImportVisible} animationType="slide">
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setBulkImportVisible(false)}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Bulk Import Users</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.modalContent}>
          <Text style={styles.instructionText}>
            Upload a CSV file with columns: Name, Email, Role, Department
          </Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Select CSV File</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  infoText: {
    color: '#666',
    fontSize: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    color: '#fff',
    fontWeight: '600',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default { TimetableManagementScreen, UserManagementScreen };
