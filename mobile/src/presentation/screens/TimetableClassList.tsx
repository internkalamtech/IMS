import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';

export default function TimetableClassListScreen() {
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        fetch('http://YOUR_IP:8000/v1/classes')
            .then(res => res.json())
            .then(data => setClasses(data));
    }, []);

    if (classes.length === 0) {
        return <Text>No classes available</Text>;
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