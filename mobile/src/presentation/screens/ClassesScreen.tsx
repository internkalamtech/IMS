import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Modal, TextInput,StyleSheet } from 'react-native';
import { UserRepositoryImpl } from '@/data/repositories/user-repository-impl';
import { GetClassesUseCase } from '@/domain/usecases/get-classes-usecase';
import { ClassData } from '@/domain/repositories/user-repository';
import { api } from '@/core/api-client';
import { Alert } from 'react-native';
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
                subject
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
                subject
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

        // Close modal
        setModalVisible(false);

        // Clear form fields
        setName('');
        setSection('');
        setAcademicPeriodId('');
        setTeacher('');
        setSubject('');

        // Reset edit state
        setSelectedClass(null);

    } catch (error: any) {
        Alert.alert('Error', error?.response?.data?.detail || 'Operation failed');
    }
};
    // Opens modal in edit mode and fills inputs with selected class data
    const handleEdit = (item: ClassData) => {
        // Save selected class so save button knows update is needed
            setSelectedClass(item);

        // Prefill form inputs with existing class values
        setName(item.name);
        setSection(item.section);
        setAcademicPeriodId(String(item.academicPeriodId));

        // Open modal
        setModalVisible(true);
    };
    // Maps backend academicPeriodId to readable academic year
    const academicYearMap: Record<number, string> = {
        1: '2025-2026',
        2: '2026-2027',
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
            // Top header section with title + add button aligned nicely
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
            <Button title="Add Class" onPress={() => setModalVisible(true)} />
        </View>
            // FlatList with 2-column grid layout
        <FlatList
            data={classes}

            // Two cards per row
            numColumns={2}

            keyExtractor={(item: any) => item.id.toString()}

            renderItem={({ item }: any) => (
                <View style={styles.classCard}>
                    <Text style={styles.classTitle}>{item.name}</Text>

                    <Text>Section: {item.section}</Text>

                    {/* Academic year */}
                    <Text>Academic Year: {item.academicPeriodId}</Text>

                    {/* Optional teacher */}
                    <Text>Teacher: {item.teacher || 'Not Assigned'}</Text>

                    {/* Optional subject */}
                    <Text>Subject: {item.subject || 'Not Assigned'}</Text>

                    {/* Placeholder total students */}
                    <Text>Total Students: {item.totalStudents}</Text>

                    {/* Edit button */}
                    <Button title="Edit" onPress={() => handleEdit(item)} />
                </View>
            )}
        />
            <Modal visible={modalVisible} animationType="slide">
                <View>
                    <TextInput
                        placeholder="Class Name"
                        value={name}
                        onChangeText={setName}
                    />

                    <TextInput
                        placeholder="Section"
                        value={section}
                        onChangeText={setSection}
                    />

                    {/* Academic Year Dropdown */}
                    <Picker
                        selectedValue={academicPeriodId}
                        onValueChange={(itemValue: string) => setAcademicPeriodId(itemValue)}>

                        <Picker.Item label="Select Academic Year" value="" />
                        <Picker.Item label="2025-2026" value="1" />
                        <Picker.Item label="2026-2027" value="2" />
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

                    <Button title="Save class" onPress={handleCreateClass} />
                    <Button title="back" onPress={() => setModalVisible(false)} />
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
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 6
    }
});
