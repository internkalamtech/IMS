import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Modal, TextInput,StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { UserRepositoryImpl } from '@/data/repositories/user-repository-impl';
import { GetClassesUseCase } from '@/domain/usecases/get-classes-usecase';
import { ClassData } from '@/domain/repositories/user-repository';
import { api } from '@/core/api-client';
import { SafeAreaView } from 'react-native-safe-area-context';
// Dropdown picker for academic year selection
import { Picker } from '@react-native-picker/picker';

export default function ClassesScreen() {
    const [classes, setClasses] = useState<ClassData[]>([]);;
    const getClassesUseCase = new GetClassesUseCase(new UserRepositoryImpl());
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [section, setSection] = useState('');
    const [academicPeriodId, setAcademicPeriodId] = useState('');
    // Stores the class currently selected for editing.
    // If null = create mode, if filled = edit mode.
    const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
    // Optional teacher input
    const [teacher, setTeacher] = useState('');
    // Optional subject input
    const [subject, setSubject] = useState(''); 
    // Optional total students field
    const [totalStudents, setTotalStudents] = useState('');
    useEffect(() => {
        const loadClasses = async () => {
            const repo = new UserRepositoryImpl();
            const useCase = new GetClassesUseCase(repo);
            const data = await useCase.execute();
            setClasses(data);
        };

        loadClasses();
    }, []);

    const handleCreateClass = async () => {
        if (!name.trim() || !section.trim()) {
            Alert.alert('Validation Error', 'Class name and section are required');
            return;
        }
    try {
        if (selectedClass) {
            // EDIT MODE → update existing class
            await api.put(`/classes/${selectedClass.id}`, {
                name,
                section,
                academicPeriodId: Number(academicPeriodId),

                // Optional teacher field
                teacher,

                // Optional subject field
                subject,
                totalStudents: Number(totalStudents) || 0,
            });
        } else {
            // CREATE MODE → add new class
            await api.post('/classes/', {
                name,
                section,
                academicPeriodId: Number(academicPeriodId),

                // Optional teacher field
                teacher,

                // Optional subject field
                subject,
                totalStudents: Number(totalStudents) || 0,
            });
        }

        // Refresh class list after save/update
        const data = await getClassesUseCase.execute();
        setClasses(data);

        // Success alert
        Alert.alert(
            'Success',
            selectedClass
                ? 'Class updated successfully'
                : 'Class created successfully'
        );

        /* Close modal */
        setModalVisible(false);

        // Clear form fields
        setName('');
        setSection('');
        setAcademicPeriodId('1');
        setTeacher('');
        setSubject('');

        // Reset edit state
        setSelectedClass(null);

    } catch (error: any) {
            Alert.alert(
                'Alert',
                error.response?.data?.detail || 'classs with same name and section already exist for this academic year'
            );
        }
};
    // Opens modal in edit mode and fills inputs with selected class data
    const handleEdit = (item: any) => {
        // Store selected class
        setSelectedClass(item);

        // Fill form values
        setName(item.name);
        setSection(item.section);

        // Academic year
        setAcademicPeriodId(String(item.academicPeriodId));

        // Teacher
        setTeacher(item.teacher || '');

        // Subject
        setSubject(item.subject || '');

        // Total students
        setTotalStudents(String(item.totalStudents || ''));

        // Open modal
        setModalVisible(true);
    };
    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/classes/${id}`);

            const data = await getClassesUseCase.execute();
            setClasses(data);

            Alert.alert('Success', 'Class deleted successfully');
        } catch (error: any) {
            Alert.alert(
                'Error',
                error.response?.data?.detail || 'Cannot Delete Classs for Active Students'
            );
        }
    };

    // Generate academic years dynamically
    const academicYears = Array.from({ length: 20 }, (_, index) => {
        const startYear = 2025 + index;

        return {
            id: index + 1,
            label: `${startYear}-${startYear + 1}`
        };
    });
    // Search text state
    const [searchText, setSearchText] = useState('');
    // Sort option state
    const [sortOption, setSortOption] = useState('name');
    // Filter classes by class name and academic year
    const filteredClasses = classes
        .filter((item: any) => {
            const yearLabel =
                academicYears.find(
                    (year) => year.id === item.academicPeriodId
                )?.label || '';

            return (
                item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                yearLabel.toLowerCase().includes(searchText.toLowerCase())
            );
        })
        .sort((a: any, b: any) => {
            if (sortOption === 'name') {
                return parseInt(a.name) - parseInt(b.name);
            }

            return a.academicPeriodId - b.academicPeriodId;
    });
    return (
        <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
           { /* Top header section with title + add button aligned nicely*/}
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
            }}
        >
            {/* Screen title */}
            <Text style={{ fontSize: 22, fontWeight: 'bold' }}>
                Classes
            </Text>

            {/* Add class button */}
            <Button title="Add Class" onPress={() => 
                {
                    setSelectedClass(null);
                    setName('');
                    setSection('');
                    setAcademicPeriodId('');
                    setTeacher('');
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
            {/* FlatList with 2-column grid layout */}
        <FlatList
            data={filteredClasses}

            numColumns={2}

            keyExtractor={(item: any) => item.id.toString()}

            renderItem={({ item }: any) => (
                <View style={styles.classCard}>
                    <Text style={styles.classTitle}>{item.name}</Text>

                    <Text>Section: {item.section}</Text>

                    {/* Optional teacher */}
                    <Text>Teacher: {item.teacher || 'Not Assigned'}</Text>

                    {/* Optional subject */}
                    <Text>Subject: {item.subject || 'Not Assigned'}</Text>

                    {/* Placeholder total students */}
                    <Text>Total Students: {item.totalStudents}</Text>

                    {/* Academic year */}
                    <View style={styles.yearBadge}>
                        <Text style={styles.yearBadgeText}>
                            {
                                academicYears.find(
                                    (year) => String(year.id) === String(item.academicPeriodId)
                                )?.label || 'No Year'
                            }
                        </Text>
                    </View>

                    {/* Edit button */}
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
                                        { text: 'Delete', onPress: () => handleDelete(item.id) }
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

                    {/* Academic Year Dropdown */}
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
                     {/* Optional teacher input */}
                    <TextInput
                        placeholder="Teacher (Optional)"
                        value={teacher}
                        onChangeText={setTeacher}
                        style={styles.input}
                    />

                    {/* Optional subject input */}
                    <TextInput
                        placeholder="Subject (Optional)"
                        value={subject}
                        onChangeText={setSubject}
                        style={styles.input}
                    />
                    {/* Optional total students input */}
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
        backgroundColor: '#fff'
    },
    yearBadge: {
        backgroundColor: '#dbeafe',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 6,
        marginBottom: 6
    },

    yearBadgeText: {
        color: '#1e3a8a',
        fontWeight: '600'
    },
    buttonRow: {
        marginTop: 12
    },

    buttonWrapper: {
        flex: 1,
        marginHorizontal: 4
    },
    editButton: {
        backgroundColor: '#2563eb',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 8
    },
    deleteButton: {
        backgroundColor: '#dc2626',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center'
    },

    buttonText: {
        color: 'white',
        fontWeight: '600'
    },
    formContainer: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 12,
        marginTop: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4
    },
    saveButton: {
        backgroundColor: '#2563eb',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10
    },

    backButton: {
        backgroundColor: '#6b7280',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center'
    },


    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15
    },

    addButton: {
        marginBottom: 15
    },

    card: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10
    },

    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold'
    },

    cardText: {
        fontSize: 14,
        marginTop: 4
    },
    classCard: {
    flex: 1,
    margin: 6,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff'
    },

    classTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 6
    },

    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        backgroundColor: '#ffffff'
    },
});
