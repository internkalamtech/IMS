import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Button,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '@/core/api-client';
import { UserRepositoryImpl } from '@/data/repositories/user-repository-impl';
import { GetClassesUseCase } from '@/domain/usecases/get-classes-usecase';
import { ClassData } from '@/domain/repositories/user-repository';

interface TeacherOption {
    id: number;
    name: string;
}

export default function ClassesScreen() {
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [section, setSection] = useState('');
    const [academicPeriodId, setAcademicPeriodId] = useState('1');
    const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
    const [teacherUserId, setTeacherUserId] = useState<number | null>(null);
    const [teacherOptions, setTeacherOptions] = useState<TeacherOption[]>([]);
    const [teacherLoading, setTeacherLoading] = useState(false);
    const [teacherError, setTeacherError] = useState('');
    const [subject, setSubject] = useState('');
    const [totalStudents, setTotalStudents] = useState('');

    const getClassesUseCase = new GetClassesUseCase(new UserRepositoryImpl());

    const academicYears = Array.from({ length: 20 }, (_, index) => {
        const startYear = 2025 + index;

        return {
            id: index + 1,
            label: `${startYear}-${startYear + 1}`,
        };
    });

    const loadClasses = async () => {
        const data = await getClassesUseCase.execute();
        setClasses(data);
    };

    const loadTeachers = async () => {
        setTeacherLoading(true);
        setTeacherError('');

        try {
            const response = await api.get('/users', {
                params: { role: 'teacher' },
            });

            setTeacherOptions(
                response.data.map((teacher: any) => ({
                    id: teacher.id,
                    name: teacher.name,
                }))
            );
        } catch (error: any) {
            setTeacherError(
                error.response?.data?.detail || 'Unable to load teacher list'
            );
        } finally {
            setTeacherLoading(false);
        }
    };

    useEffect(() => {
        loadClasses();
        loadTeachers();
    }, []);

    const handleCreateClass = async () => {
        if (!name.trim() || !section.trim() || !academicPeriodId.trim()) {
            Alert.alert('Validation Error', 'Class name, section and year are required');
            return;
        }

        try {
            const payload = {
                name,
                section,
                academicPeriodId: Number(academicPeriodId),
                teacherUserId: teacherUserId ?? null,
                subject: subject || null,
                totalStudents: Number(totalStudents) || 0,
            };

            if (selectedClass) {
                await api.put(`/classes/${selectedClass.id}`, payload);
            } else {
                await api.post('/classes/', payload);
            }

            await loadClasses();

            Alert.alert(
                'Success',
                selectedClass ? 'Class updated successfully' : 'Class created successfully'
            );

            setModalVisible(false);
            setSelectedClass(null);
            setName('');
            setSection('');
            setAcademicPeriodId(academicYears[0]?.id.toString() || '1');
            setTeacherUserId(null);
            setSubject('');
            setTotalStudents('');
        } catch (error: any) {
            Alert.alert(
                'Alert',
                error.response?.data?.detail ||
                    'Class with same name and section already exists for this academic year'
            );
        }
    };

    const handleEdit = (item: ClassData) => {
        setSelectedClass(item);
        setName(item.name);
        setSection(item.section);
        setAcademicPeriodId(String(item.academicPeriodId));
        setTeacherUserId(item.teacherUserId ?? null);
        setSubject(item.subject || '');
        setTotalStudents(String(item.totalStudents || ''));
        setModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/classes/${id}`);
            await loadClasses();
            Alert.alert('Success', 'Class deleted successfully');
        } catch (error: any) {
            Alert.alert(
                'Error',
                error.response?.data?.detail || 'Cannot delete class with active students'
            );
        }
    };

    const [searchText, setSearchText] = useState('');
    const [sortOption, setSortOption] = useState('name');

    const filteredClasses = classes
        .filter((item) => {
            const yearLabel =
                academicYears.find((year) => year.id === item.academicPeriodId)
                    ?.label || '';

            return (
                item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                yearLabel.toLowerCase().includes(searchText.toLowerCase())
            );
        })
        .sort((a, b) => {
            if (sortOption === 'name') {
                return a.name.localeCompare(b.name);
            }

            return a.academicPeriodId - b.academicPeriodId;
        });

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ padding: 20 }}>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16,
                    }}
                >
                    <Text style={{ fontSize: 22, fontWeight: 'bold' }}>
                        Classes
                    </Text>

                    <Button
                        title="Add Class"
                        onPress={() => {
                            setSelectedClass(null);
                            setName('');
                            setSection('');
                            setAcademicPeriodId(academicYears[0]?.id.toString() || '1');
                            setTeacherUserId(null);
                            setSubject('');
                            setTotalStudents('');
                            setModalVisible(true);
                        }}
                    />
                </View>

                <TextInput
                    placeholder="Search by class or academic year"
                    value={searchText}
                    onChangeText={setSearchText}
                    style={styles.input}
                />

                <Picker
                    selectedValue={sortOption}
                    onValueChange={(itemValue) => setSortOption(itemValue)}
                >
                    <Picker.Item label="Sort by Class Name" value="name" />
                    <Picker.Item label="Sort by Academic Year" value="year" />
                </Picker>

                <FlatList
                    data={filteredClasses}
                    numColumns={2}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.classCard}>
                            <Text style={styles.classTitle}>{item.name}</Text>
                            <Text>Section: {item.section}</Text>
                            <Text>Teacher: {item.teacherName || 'Not Assigned'}</Text>
                            <Text>Subject: {item.subject || 'Not Assigned'}</Text>
                            <Text>Total Students: {item.totalStudents}</Text>
                            <View style={styles.yearBadge}>
                                <Text style={styles.yearBadgeText}>
                                    {
                                        academicYears.find(
                                            (year) => String(year.id) === String(item.academicPeriodId)
                                        )?.label || 'No Year'
                                    }
                                </Text>
                            </View>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => handleEdit(item)}
                                >
                                    <Text style={styles.buttonText}>✏ Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() =>
                                        Alert.alert(
                                            'Confirm Delete',
                                            'Are you sure you want to delete this class?',
                                            [
                                                { text: 'Cancel', style: 'cancel' },
                                                { text: 'Delete', onPress: () => handleDelete(item.id) },
                                            ]
                                        )
                                    }
                                >
                                    <Text style={styles.buttonText}>🗑 Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', marginTop: 20 }}>
                            No classes found
                        </Text>
                    }
                />

                <Modal visible={modalVisible} animationType="slide">
                    <View style={styles.formContainer}>
                        <TextInput
                            placeholder="Class Name"
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                        />

                        <TextInput
                            placeholder="Section"
                            value={section}
                            onChangeText={setSection}
                            style={styles.input}
                        />

                        <Picker
                            selectedValue={academicPeriodId}
                            onValueChange={(itemValue) => setAcademicPeriodId(itemValue)}
                        >
                            {academicYears.map((year) => (
                                <Picker.Item
                                    key={year.id}
                                    label={year.label}
                                    value={String(year.id)}
                                />
                            ))}
                        </Picker>

                        <Text style={{ marginBottom: 8, fontWeight: '600' }}>
                            Class Teacher
                        </Text>
                        {teacherLoading ? (
                            <ActivityIndicator />
                        ) : (
                            <Picker
                                selectedValue={teacherUserId !== null ? String(teacherUserId) : ''}
                                onValueChange={(itemValue) =>
                                    setTeacherUserId(itemValue ? Number(itemValue) : null)
                                }
                            >
                                <Picker.Item label="No teacher assigned" value="" />
                                {teacherOptions.map((teacher) => (
                                    <Picker.Item
                                        key={teacher.id}
                                        label={teacher.name}
                                        value={String(teacher.id)}
                                    />
                                ))}
                            </Picker>
                        )}

                        {teacherError ? (
                            <Text style={{ color: 'red', marginBottom: 12 }}>
                                {teacherError}
                            </Text>
                        ) : null}

                        <TextInput
                            placeholder="Subject (Optional)"
                            value={subject}
                            onChangeText={setSubject}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Total Students (Optional)"
                            value={totalStudents}
                            onChangeText={setTotalStudents}
                            keyboardType="numeric"
                            style={styles.input}
                        />

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleCreateClass}
                        >
                            <Text style={styles.buttonText}>
                                {selectedClass ? 'Update Class' : 'Save Class'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Back</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    yearBadge: {
        backgroundColor: '#dbeafe',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 6,
        marginBottom: 6,
    },
    yearBadgeText: {
        color: '#1e3a8a',
        fontWeight: '600',
    },
    buttonRow: {
        marginTop: 12,
    },
    buttonWrapper: {
        flex: 1,
        marginHorizontal: 4,
    },
    editButton: {
        backgroundColor: '#2563eb',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 8,
    },
    deleteButton: {
        backgroundColor: '#dc2626',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
    },
    formContainer: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 12,
        marginTop: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    saveButton: {
        backgroundColor: '#2563eb',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    backButton: {
        backgroundColor: '#6b7280',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    addButton: {
        marginBottom: 15,
    },
    card: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardText: {
        fontSize: 14,
        marginTop: 4,
    },
    classCard: {
        flex: 1,
        margin: 6,
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    classTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        backgroundColor: '#ffffff',
    },
});
