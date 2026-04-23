"""
mobile/src/presentation/screens/ClassDeleteConfirmModal.tsx
STORY_CLASS_DELETE_API - Class Deletion Confirmation Modal
"""

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import classService from '../../data/services/classService';

interface ClassDeleteConfirmModalProps {
  visible: boolean;
  classId: string;
  className: string;
  studentCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

export const ClassDeleteConfirmModal: React.FC<ClassDeleteConfirmModalProps> = ({
  visible,
  classId,
  className,
  studentCount,
  onClose,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [canDelete] = useState(studentCount === 0);

  const handleDelete = async () => {
    if (!canDelete) {
      Alert.alert(
        'Cannot Delete',
        `This class has ${studentCount} active student(s). Please remove all students before deleting.`
      );
      return;
    }

    try {
      setDeleting(true);
      await classService.deleteClass(classId);
      Alert.alert('Success', 'Class deleted successfully');
      onConfirm();
      onClose();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete class');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Delete Class</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.message}>
              Are you sure you want to delete <Text style={styles.bold}>{className}</Text>?
            </Text>

            {studentCount > 0 ? (
              <>
                <View style={styles.warningBox}>
                  <Text style={styles.warningTitle}>⚠️ Cannot Delete</Text>
                  <Text style={styles.warningText}>
                    This class has <Text style={styles.bold}>{studentCount} active student(s)</Text>.
                    {'\n\n'}
                    Please remove all students from this class before deletion.
                  </Text>
                </View>
                <Text style={styles.note}>
                  Once all students are removed, this class can be deleted.
                </Text>
              </>
            ) : (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  This action cannot be undone. All class data will be permanently deleted.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelBtn]}
              onPress={onClose}
              disabled={deleting}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.deleteBtn,
                !canDelete && styles.deleteBtnDisabled,
              ]}
              onPress={handleDelete}
              disabled={!canDelete || deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.deleteBtnText}>Delete Class</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  message: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  warningBox: {
    backgroundColor: '#fff3e0',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
    marginVertical: 12,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#d84315',
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
    marginVertical: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#1565c0',
    lineHeight: 18,
  },
  note: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  buttons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  cancelBtnText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#666',
  },
  deleteBtn: {
    backgroundColor: '#f44336',
  },
  deleteBtnDisabled: {
    opacity: 0.6,
  },
  deleteBtnText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#fff',
  },
});

export default ClassDeleteConfirmModal;
