"""
mobile/src/presentation/screens/ClassListScreen.tsx
STORY_CLASS_LIST_API - Class List UI Screen
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
  FlatList,
} from 'react-native';
import classService from '../../data/services/classService';

interface Class {
  id: string;
  name: string;
  section: string;
  academicYear: string;
  classTeacherName?: string;
  currentStudentCount: number;
  maxStudents?: number;
  totalSubjects: number;
  status: string;
}

export const ClassListScreen: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    loadClasses();
  }, [selectedYear]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const response = await classService.listClasses(
        selectedYear,
        undefined,
        0,
        50
      );
      setClasses(response.items);
      setFilteredClasses(response.items);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = classes.filter(
      (cls) =>
        cls.name.toLowerCase().includes(query.toLowerCase()) ||
        cls.section.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredClasses(filtered);
    setCurrentPage(0);
  };

  const handleDelete = (classId: string) => {
    Alert.alert(
      'Delete Class',
      'Are you sure you want to delete this class?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await classService.deleteClass(classId);
              Alert.alert('Success', 'Class deleted successfully');
              loadClasses();
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const paginatedClasses = filteredClasses.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const renderClassCard = ({ item }: { item: Class }) => (
    <View style={styles.classCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.className}>
          {item.name} - Section {item.section}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'active' ? '#4CAF50' : '#FFC107' },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.label}>
          Academic Year: <Text style={styles.value}>{item.academicYear}</Text>
        </Text>
        <Text style={styles.label}>
          Class Teacher: <Text style={styles.value}>{item.classTeacherName || 'Not assigned'}</Text>
        </Text>
        <Text style={styles.label}>
          Students: <Text style={styles.value}>{item.currentStudentCount}</Text>
          {item.maxStudents && <Text style={styles.value}> / {item.maxStudents}</Text>}
        </Text>
        <Text style={styles.label}>
          Subjects: <Text style={styles.value}>{item.totalSubjects}</Text>
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={[styles.button, styles.editBtn]}>
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteBtn]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Classes</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add Class</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filterSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or section..."
          value={searchQuery}
          onChangeText={handleSearch}
        />

        <View style={styles.yearSelector}>
          <TouchableOpacity
            style={[styles.yearBtn, selectedYear === '2024-2025' && styles.yearBtnActive]}
            onPress={() => setSelectedYear('2024-2025')}
          >
            <Text style={styles.yearBtnText}>2024-25</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.yearBtn, selectedYear === '2025-2026' && styles.yearBtnActive]}
            onPress={() => setSelectedYear('2025-2026')}
          >
            <Text style={styles.yearBtnText}>2025-26</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading classes...</Text>
        </View>
      ) : filteredClasses.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No classes found</Text>
        </View>
      ) : (
        <>
          {/* Classes List */}
          <FlatList
            data={paginatedClasses}
            renderItem={renderClassCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />

          {/* Pagination */}
          {filteredClasses.length > pageSize && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageBtn, currentPage === 0 && styles.pageBtnDisabled]}
                onPress={() => setCurrentPage(Math.max(0, currentPage - 1))}
              >
                <Text style={styles.pageBtnText}>Previous</Text>
              </TouchableOpacity>

              <Text style={styles.pageInfo}>
                Page {currentPage + 1} of{' '}
                {Math.ceil(filteredClasses.length / pageSize)}
              </Text>

              <TouchableOpacity
                style={[
                  styles.pageBtn,
                  currentPage >= Math.ceil(filteredClasses.length / pageSize) - 1 &&
                    styles.pageBtnDisabled,
                ]}
                onPress={() =>
                  setCurrentPage(
                    Math.min(
                      Math.ceil(filteredClasses.length / pageSize) - 1,
                      currentPage + 1
                    )
                  )
                }
              >
                <Text style={styles.pageBtnText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
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
    backgroundColor: '#2196F3',
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
  },
  filterSection: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  yearSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  yearBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  yearBtnActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  yearBtnText: {
    fontWeight: '600',
    color: '#333',
  },
  listContainer: {
    padding: 12,
  },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  className: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 12,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  value: {
    fontWeight: 'bold',
    color: '#333',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: '#4CAF50',
  },
  deleteBtn: {
    backgroundColor: '#f44336',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  pageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  pageBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  pageInfo: {
    fontSize: 13,
    color: '#666',
  },
});

export default ClassListScreen;
