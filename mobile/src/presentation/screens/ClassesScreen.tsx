import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Modal, TextInput } from 'react-native';
import { UserRepositoryImpl } from '@/data/repositories/user-repository-impl';
import { GetClassesUseCase } from '@/domain/usecases/get-classes-usecase';
import { ClassData } from '@/domain/repositories/user-repository';
import { api } from '@/core/api-client';


export default function ClassesScreen() {
    const [classes, setClasses] = useState<ClassData[]>([]);;
    const getClassesUseCase = new GetClassesUseCase(new UserRepositoryImpl());
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [section, setSection] = useState('');
    const [academicPeriodId, setAcademicPeriodId] = useState('');

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
            await api.post('/classes', {
                name,
                section,
                academicPeriodId: Number(academicPeriodId)
            });

            const data = await getClassesUseCase.execute();
            setClasses(data);

            setModalVisible(false);
            setName('');
            setSection('');
            setAcademicPeriodId('');
        } 
        catch (error) {
            console.log('Create class error:', error);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Button title="Add Class" onPress={() => setModalVisible(true)} />
            <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Classes</Text>

            <FlatList
                data={classes}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={({ item }: any) => (
                    <View style={{ padding: 10, borderBottomWidth: 1 }}>
                        <Text>{item.name}</Text>
                        <Text>Section: {item.section}</Text>
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

                    <TextInput
                        placeholder="Academic Period ID"
                        value={academicPeriodId}
                        onChangeText={setAcademicPeriodId}
                    />

                    <Button title="Save" onPress={handleCreateClass} />
                    <Button title="Close" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>
        </View>
    );
}