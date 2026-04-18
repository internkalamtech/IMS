import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TimetableScreen() {
    // 🔹 Selected day state
    const [selectedDay, setSelectedDay] = useState('Monday');

    // 🔹 Timetable data
    const [timetable, setTimetable] = useState<any[]>([]);

    // 🔹 Form states
    const [showForm, setShowForm] = useState(false);
    const [subject, setSubject] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [roomId, setRoomId] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [type, setType] = useState('PERIOD');
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    // extract unique time slots
    const timeSlots = [
        ...new Set(timetable.map((t: any) => t.start_time)),
    ];

    // 🔹 Fetch timetable from backend
    const fetchTimetable = async () => {
        try {
            const res = await fetch(
                `http://YOUR_API_URL/v1/timetables?day=${selectedDay}&class_id=1`
            );
            const data = await res.json();
            setTimetable(data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchTimetable();
    }, [selectedDay]);

    // 🔹 Add new period
    const handleAdd = async () => {
        if (!startTime || !endTime) {
            Alert.alert('Error', 'Please fill required fields');
            return;
        }

        const payload = {
            class_id: 1,
            subject: type === 'BREAK' ? null : subject,
            teacher_id: type === 'BREAK' ? null : Number(teacherId),
            room_id: type === 'BREAK' ? null : Number(roomId),
            day: selectedDay,
            start_time: startTime,
            end_time: endTime,
            type,
        };

        try {
            await fetch('http://YOUR_API_URL/v1/timetables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            Alert.alert('Success', 'Period added');
            setShowForm(false);
            fetchTimetable();
        } catch (error) {
            console.log(error);
        }
    };

    // 🔹 Delete period
    const handleDelete = async (id: number) => {
        await fetch(`http://YOUR_API_URL/v1/timetables/${id}`, {
            method: 'DELETE',
        });

        fetchTimetable();
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Timetable</Text>

            {/* 🔹 Day Selector */}
            <View style={styles.dayContainer}>
                {days.map((day) => (
                    <TouchableOpacity
                        key={day}
                        style={[
                            styles.dayButton,
                            selectedDay === day && styles.activeDay,
                        ]}
                        onPress={() => setSelectedDay(day)}
                    >
                        <Text>{day}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 🔹 Add Button */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowForm(!showForm)}
            >
                <Text style={{ color: '#fff' }}>+ Add Period</Text>
            </TouchableOpacity>

            {/* 🔹 Form */}
            {showForm && (
                <View style={styles.form}>
                    <TextInput
                        placeholder="Subject"
                        value={subject}
                        onChangeText={setSubject}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Teacher ID"
                        value={teacherId}
                        onChangeText={setTeacherId}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Room ID"
                        value={roomId}
                        onChangeText={setRoomId}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Start Time (09:00)"
                        value={startTime}
                        onChangeText={setStartTime}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="End Time (10:00)"
                        value={endTime}
                        onChangeText={setEndTime}
                        style={styles.input}
                    />

                    {/* 🔹 Type Toggle */}
                    <TouchableOpacity
                        onPress={() =>
                            setType(type === 'PERIOD' ? 'BREAK' : 'PERIOD')
                        }
                    >
                        <Text>Type: {type}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleAdd}
                    >
                        <Text style={{ color: '#fff' }}>Save</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* 🔹 Timetable List */}
            {timetable.map((item) => (
                <View style={{ marginTop: 20 }}>

                    {/* HEADER ROW (TIME) */}
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ width: 80, fontWeight: 'bold' }}>Day</Text>

                        {timeSlots.map((time) => (
                            <Text
                                key={time}
                                style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}
                            >
                                {time}
                            </Text>
                        ))}
                    </View>

                    {/* ROWS (DAYS) */}
                    {days.map((day) => (
                        <View key={day} style={{ flexDirection: 'row', marginTop: 10 }}>

                                    {/* DAY NAME */}
                                    <Text style={{ width: 80 }}>{day}</Text>

                                    {/* CELLS */}
                                    {timeSlots.map((time) => {
                                        const item = timetable.find(
                                            (t: any) =>
                                                t.day === day && t.start_time === time
                                        );

                                        return (
                                            <View
                                                key={time}
                                                style={{
                                                    flex: 1,
                                                    borderWidth: 1,
                                                    padding: 5,
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {item ? (
                                                    <>
                                                        <Text>
                                                            {item.type === 'BREAK'
                                                                ? 'Break'
                                                                : item.subject}
                                                        </Text>

                                                        {/* STEP 5 BUTTONS */}
                                                        <TouchableOpacity>
                                                            <Text style={{ color: 'blue' }}>
                                                                Edit
                                                            </Text>
                                                        </TouchableOpacity>

                                                        <TouchableOpacity
                                                            onPress={() => handleDelete(item.id)}
                                                        >
                                                            <Text style={{ color: 'red' }}>
                                                                Delete
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </>
                                                ) : (
                                                    <Text>-</Text>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            ))}
                        </View>
            ))}
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: { padding: 16 },
    title: { fontSize: 22, fontWeight: 'bold' },

    dayContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10 },
    dayButton: {
        padding: 8,
        backgroundColor: '#eee',
        margin: 4,
        borderRadius: 5,
    },
    activeDay: { backgroundColor: '#4CAF50' },

    addButton: {
        backgroundColor: '#007bff',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
    },

    form: {
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },

    input: {
        borderWidth: 1,
        padding: 8,
        marginVertical: 5,
        borderRadius: 5,
    },

    saveButton: {
        backgroundColor: 'green',
        padding: 10,
        alignItems: 'center',
        marginTop: 10,
        borderRadius: 5,
    },

    card: {
        padding: 10,
        borderWidth: 1,
        marginVertical: 5,
        borderRadius: 5,
    },
});