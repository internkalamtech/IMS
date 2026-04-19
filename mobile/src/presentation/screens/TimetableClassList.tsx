import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function TimetableClassListScreen() {
    const [classes, setClasses] = useState([]);

    useFocusEffect(
    useCallback(() => {
        const fetchClasses = async () => {
            try {
                const res = await fetch('http://10.237.144.29:8000/v1/classes');
                console.log("Status:", res.status);

                const data = await res.json();
                console.log("API DATA:", data);

                setClasses(Array.isArray(data) ? data : data.data || []);

            } catch (err) {
                console.log("FETCH ERROR:", err);
            }
        };

        fetchClasses();
    }, [])
);
    if (!classes || classes.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 16 }}>
                    No classes available you can add class from manage class scetion 
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={classes}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={{
                        padding: 15,
                        borderBottomWidth: 1,
                    }}
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
                    <Text>{item.name}</Text>
                </TouchableOpacity>
            )}
        />
    );
}