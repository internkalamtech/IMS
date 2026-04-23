/**
 * FeeStructureScreen.tsx
 * STORY_FEE_STRUCTURE_CRUD - Manage Fee Structures (Frontend)
 * 
 * Allows admins to create, list, update, and delete fee structures for different classes.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';

interface FeeStructure {
  id: string;
  className: string;
  academicYear: string;
  feeHeads: FeeHead[];
  installmentPlans: Installment[];
  totalAmount: number;
  createdAt: string;
}

interface FeeHead {
  name: string;
  amount: number;
}

interface Installment {
  dueDate: string;
  amount: number;
  installmentNumber: number;
}

export const FeeStructureScreen: React.FC = () => {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    className: '',
    academicYear: '',
    feeHeads: [{ name: '', amount: 0 }],
    installmentPlans: [{ dueDate: '', amount: 0, installmentNumber: 1 }],
  });

  /**
   * Fetch all fee structures filtered by class
   */
  useEffect(() => {
    fetchFeeStructures();
  }, []);

  const fetchFeeStructures = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await feeStructureService.list();
      // setFeeStructures(response.data);
      console.log('Fetching fee structures...');
    } catch (error) {
      Alert.alert('Error', 'Failed to load fee structures');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new fee structure
   */
  const handleCreateStructure = async () => {
    if (!formData.className || !formData.academicYear) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      // TODO: Replace with actual API call
      // await feeStructureService.create(formData);
      Alert.alert('Success', 'Fee structure created successfully');
      setModalVisible(false);
      resetForm();
      fetchFeeStructures();
    } catch (error) {
      Alert.alert('Error', 'Failed to create fee structure');
    }
  };

  /**
   * Update existing fee structure
   */
  const handleUpdateStructure = async () => {
    if (!editingId) return;

    try {
      // TODO: Replace with actual API call
      // await feeStructureService.update(editingId, formData);
      Alert.alert('Success', 'Fee structure updated successfully');
      setModalVisible(false);
      resetForm();
      fetchFeeStructures();
    } catch (error) {
      Alert.alert('Error', 'Failed to update fee structure');
    }
  };

  /**
   * Delete a fee structure with confirmation
   */
  const handleDeleteStructure = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this fee structure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Replace with actual API call
              // await feeStructureService.delete(id);
              Alert.alert('Success', 'Fee structure deleted successfully');
              fetchFeeStructures();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete fee structure');
            }
          },
        },
      ]
    );
  };

  /**
   * Open edit modal with existing data
   */
  const handleEditStructure = (structure: FeeStructure) => {
    setEditingId(structure.id);
    setFormData({
      className: structure.className,
      academicYear: structure.academicYear,
      feeHeads: structure.feeHeads,
      installmentPlans: structure.installmentPlans,
    });
    setModalVisible(true);
  };

  /**
   * Reset form data
   */
  const resetForm = () => {
    setFormData({
      className: '',
      academicYear: '',
      feeHeads: [{ name: '', amount: 0 }],
      installmentPlans: [{ dueDate: '', amount: 0, installmentNumber: 1 }],
    });
    setEditingId(null);
  };

  /**
   * Calculate total amount from fee heads
   */
  const calculateTotal = () => {
    return formData.feeHeads.reduce((sum, head) => sum + (head.amount || 0), 0);
  };

  const renderFeeStructureItem = ({ item }: { item: FeeStructure }) => (
    <View style={styles.listItem}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.className}</Text>
        <Text style={styles.itemSubtitle}>{item.academicYear}</Text>
      </View>
      <Text style={styles.itemAmount}>₹{item.totalAmount}</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => handleEditStructure(item)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDeleteStructure(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fee Structures</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Add New</Text>
        </TouchableOpacity>
      </View>

      {feeStructures.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No fee structures found</Text>
        </View>
      ) : (
        <FlatList
          data={feeStructures}
          renderItem={renderFeeStructureItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingId ? 'Edit Fee Structure' : 'Create Fee Structure'}
            </Text>

            <ScrollView style={styles.formContainer}>
              {/* Class Name */}
              <Text style={styles.label}>Class Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Class 10-A"
                value={formData.className}
                onChangeText={(text) =>
                  setFormData({ ...formData, className: text })
                }
              />

              {/* Academic Year */}
              <Text style={styles.label}>Academic Year *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2024-2025"
                value={formData.academicYear}
                onChangeText={(text) =>
                  setFormData({ ...formData, academicYear: text })
                }
              />

              {/* Fee Heads */}
              <Text style={styles.sectionTitle}>Fee Heads</Text>
              {formData.feeHeads.map((head, index) => (
                <View key={index} style={styles.feeHeadRow}>
                  <TextInput
                    style={[styles.input, styles.flex1]}
                    placeholder="Fee Head Name"
                    value={head.name}
                    onChangeText={(text) => {
                      const newHeads = [...formData.feeHeads];
                      newHeads[index].name = text;
                      setFormData({ ...formData, feeHeads: newHeads });
                    }}
                  />
                  <TextInput
                    style={[styles.input, styles.flex1]}
                    placeholder="Amount"
                    keyboardType="numeric"
                    value={head.amount.toString()}
                    onChangeText={(text) => {
                      const newHeads = [...formData.feeHeads];
                      newHeads[index].amount = parseFloat(text) || 0;
                      setFormData({ ...formData, feeHeads: newHeads });
                    }}
                  />
                </View>
              ))}

              {/* Total Calculation */}
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalAmount}>₹{calculateTotal()}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={editingId ? handleUpdateStructure : handleCreateStructure}
                >
                  <Text style={styles.buttonText}>
                    {editingId ? 'Update' : 'Create'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
    padding: 8,
  },
  listItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  itemAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  formContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  feeHeadRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  flex1: {
    flex: 1,
    marginHorizontal: 4,
  },
  totalBox: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 4,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    backgroundColor: '#999',
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
    marginLeft: 8,
  },
});
