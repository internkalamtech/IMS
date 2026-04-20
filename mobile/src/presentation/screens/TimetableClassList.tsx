import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TimetableClassListScreen() {

    // 🔹 State to store classes
    const [classes, setClasses] = useState<any[]>([]);

    // 🔹 Loading state
    const [loading, setLoading] = useState(true);

    // 🔹 Fetch classes when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            const fetchClasses = async () => {
                try {
                    setLoading(true);

                    const res = await fetch('http://10.237.144.29:8000/api/v1/classes');
                    const data = await res.json();

                    console.log("CLASSES DATA:", data);

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

    // 🔹 Loading UI
    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    // 🔹 Empty UI
    if (classes.length === 0) {
        return (
            <SafeAreaView style={styles.center}>
                <Text>No classes available. Add from Class Management.</Text>
            </SafeAreaView>
        );
    }

    // 🔹 Main UI
    return (
        <SafeAreaView style={styles.container}>

            {/* 🔹 Header */}
            <Text style={styles.header}>Classes</Text>

            {/* 🔹 Class List */}
            <FlatList
                data={classes}
                keyExtractor={(item: any) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => {

                    // Debug each item
                    console.log("CLASS ITEM:", item);

                    return (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() =>
                                router.push({
                                    pathname: '/(tabs)/timetable',
                                    params: {
                                        classId: item.id,
                                        className: item.name,
                                    },
                                })
                            }
                        >

                            {/* 🔹 Class Name */}
                            <Text style={styles.className}>
                                {item.name || 'No Name'}
                            </Text>

                            {/* 🔹 Section */}
                            {item.section && (
                                <Text style={styles.subText}>
                                    Section: {item.section}
                                </Text>
                            )}

                            {/* 🔹 Academic Year */}
                            {item.academic_year && (
                                <Text style={styles.subText}>
                                    Year: {item.academic_year}
                                </Text>
                            )}

                            {/* 🔹 Grade */}
                            {item.grade && (
                                <Text style={styles.subText}>
                                    Grade: {item.grade}
                                </Text>
                            )}

                            {/* 🔹 Any other fields (optional) */}
                            {item.class_teacher && (
                                <Text style={styles.subText}>
                                    Teacher: {item.class_teacher}
                                </Text>
                            )}

                        </TouchableOpacity>
                    );
                }}
            />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    // 🔹 Main container
    container: {
        flex: 1,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
    },

    // 🔹 Centered view (loading / empty)
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // 🔹 Header text
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 16,
    },

    // 🔹 Card for each class
    card: {
        padding: 16,
        marginBottom: 12,
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        elevation: 2, // shadow (Android)
    },

    // 🔹 Class name
    className: {
        fontSize: 18,
        fontWeight: '600',
    },

    // 🔹 Sub text (section, year, etc.)
    subText: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
});