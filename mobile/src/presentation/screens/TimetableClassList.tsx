import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    TextInput
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TimetableClassListScreen() {

    // State to store all classes
    const [classes, setClasses] = useState<any[]>([]);

    // Loading state
    const [loading, setLoading] = useState(true);

    // Search input state
    const [search, setSearch] = useState('');

    // Filter classes based on search input
    const filteredClasses = classes.filter((c: any) =>
        (c.name || '').toLowerCase().includes(search.toLowerCase())
    );

    // Fetch classes when screen is focused
    useFocusEffect(
        useCallback(() => {
            const fetchClasses = async () => {
                try {
                    setLoading(true);

                    const res = await fetch('http://10.237.144.29:8000/api/v1/classes');
                    const data = await res.json();

                    // Ensure correct format
                    setClasses(Array.isArray(data) ? data : data.data || []);

                } catch (err) {
                    console.log("FETCH ERROR:", err);
                } finally {
                    setLoading(false);
                }
            };

            fetchClasses();
        }, [])
    );

    // Loading UI
    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    // Empty state when no classes exist
    if (classes.length === 0) {
        return (
            <SafeAreaView style={styles.center}>
                <Text>No classes available. Add class from Class Management Section.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>

            {/* Header */}
            <Text style={styles.header}>Classes</Text>

            {/* Search Input */}
            <TextInput
                placeholder="Search class (e.g. 10th)"
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
            />

            {/* If no match found */}
            {filteredClasses.length === 0 ? (
                <View style={styles.center}>
                    <Text>No matching classes found</Text>
                </View>
            ) : (

                // Class List
                <FlatList
                    data={filteredClasses} // use filtered data
                    keyExtractor={(item: any) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (

                        <TouchableOpacity
                            style={styles.card}
                            onPress={() =>
                                router.push({
                                    pathname: '/(tabs)/timetable',
                                    params: {
                                        classId: item.id,
                                        className: item.name,
                                        section: item.section
                                    },
                                } as any)
                            }
                        >

                            {/* Class Name + Section */}
                            <Text style={styles.className}>
                                {item.name || 'No Name'} {item.section ? `- ${item.section}` : ''}
                            </Text>

                            {/* Academic Year */}
                            {item.academic_year && (
                                <Text style={styles.subText}>
                                    Year: {item.academic_year}
                                </Text>
                            )}

                            {/* Grade */}
                            {item.grade && (
                                <Text style={styles.subText}>
                                    Grade: {item.grade}
                                </Text>
                            )}

                            {/* Class Teacher */}
                            {item.class_teacher && (
                                <Text style={styles.subText}>
                                    Teacher: {item.class_teacher}
                                </Text>
                            )}

                        </TouchableOpacity>
                    )}
                />
            )}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    // Main container
    container: {
        flex: 1,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
    },

    // Centered layout
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Header
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 16,
    },

    // Search input
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
    },

    // Card design
    card: {
        padding: 16,
        marginBottom: 12,
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        elevation: 2,
    },

    // Class name
    className: {
        fontSize: 18,
        fontWeight: '600',
    },

    // Sub text
    subText: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
});