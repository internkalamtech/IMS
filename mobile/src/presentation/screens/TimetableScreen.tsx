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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

export default function TimetableScreen() {
    // 🔹 Get params from previous screen
    const { classId, className, section } = useLocalSearchParams();

    // 🔹 State
    const [timetable, setTimetable] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedDay, setSelectedDay] = useState('Monday');

    // 🔹 Form fields
    const [subject, setSubject] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [roomId, setRoomId] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [type, setType] = useState('PERIOD');
    const [periodNumber, setPeriodNumber] = useState('');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // 🔹 Fetch timetable
    const fetchTimetable = async () => {
        try {
            const res = await fetch(
                `http://10.237.144.29:8000/api/v1/timetables/?class_id=${classId}`
            );
            const data = await res.json();

            setTimetable(Array.isArray(data) ? data : data.data || []);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchTimetable();
    }, []);

    // 🔹 Get next period number
    const getNextPeriodNumber = () => {
        if (!timetable.length) return 1;
        const max = Math.max(...timetable.map((t: any) => t.periodNumber || 0));
        return max + 1;
    };

    // 🔥 VALIDATIONS
    const validate = () => {
        // ❌ Same time conflict
        const timeConflict = timetable.find(
            (t: any) =>
                t.day === selectedDay &&
                t.startTime === startTime
        );

        if (timeConflict) {
            Alert.alert('Error', 'Time slot already exists');
            return false;
        }
        if (!periodNumber) {
                Alert.alert("Error", "Enter period number");
                return false;
            }

        const duplicatePeriod = timetable.find(
            (t: any) =>
                t.day === selectedDay &&
                t.periodNumber === Number(periodNumber)
        );

        if (duplicatePeriod) {
            Alert.alert("Error", "Period already exists for this day");
            return false;
        }

        // ❌ Teacher conflict
        const teacherConflict = timetable.find(
            (t: any) =>
                t.day === selectedDay &&
                t.startTime === startTime &&
                t.teacher === teacherId
        );

        if (teacherConflict) {
            Alert.alert('Error', 'Teacher already assigned');
            return false;
        }

        // ❌ Room conflict
        const roomConflict = timetable.find(
            (t: any) =>
                t.day === selectedDay &&
                t.startTime === startTime &&
                t.room === roomId
        );

        if (roomConflict) {
            Alert.alert('Error', 'Room already occupied');
            return false;
        }

        return true;
    };

    // 🔹 ADD
    const handleAdd = async () => {
        if (!validate()) return;

        const payload = {
            classId: Number(classId),
            subject,
            teacher: teacherId,
            room: roomId,
            day: selectedDay,
            periodNumber: Number(periodNumber),
            startTime,
            endTime,           
            type,
        };

        try {
            await fetch('http://10.237.144.29:8000/api/v1/timetables/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            Alert.alert('Success', 'Added');

            setShowForm(false);
            fetchTimetable();

        } catch (err) {
            console.log(err);
        }
    };

    // 🔹 DELETE
    const handleDelete = async (id: number) => {
        await fetch(`http://10.237.144.29:8000/api/v1/timetables/${id}`, {
            method: 'DELETE',
        });

        fetchTimetable();
    };

    // 🔹 Period numbers for grid
    const periods = [
        ...new Set(timetable.map((t: any) => t.periodNumber))
    ].sort((a, b) => a - b);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={styles.container}>

                {/* 🔹 HEADER */}
                <Text style={styles.title}>
                    Timetable : {className} "{section}"
                </Text>

                {/* 🔹 ADD BUTTON */}
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowForm(!showForm)}
                >
                    <Text style={{ color: '#fff' }}>+ Add</Text>
                </TouchableOpacity>

                {/* 🔹 FORM (ONLY WHEN CLICKED) */}
                {showForm && (
                    <View style={styles.form}>

                        {/* Day selection */}
                        <ScrollView horizontal>
                            {days.map((day) => (
                                <TouchableOpacity
                                    key={day}
                                    style={[
                                        styles.dayBtn,
                                        selectedDay === day && styles.activeDay
                                    ]}
                                    onPress={() => setSelectedDay(day)}
                                >
                                    <Text>{day}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Inputs */}
                        <TextInput placeholder="Subject" style={styles.input} onChangeText={setSubject} />
                        <TextInput placeholder="Teacher ID" style={styles.input} onChangeText={setTeacherId} />
                        <TextInput placeholder="Room ID" style={styles.input} onChangeText={setRoomId} />
                        <TextInput placeholder="Period Number (e.g. 1,2,3)" style={styles.input} value={periodNumber} onChangeText={setPeriodNumber} keyboardType="numeric"/>
                        <TextInput placeholder="Start Time (09:00)" style={styles.input} onChangeText={setStartTime} />
                        <TextInput placeholder="End Time (10:00)" style={styles.input} onChangeText={setEndTime} />

                        <TouchableOpacity style={styles.saveButton} onPress={handleAdd}>
                            <Text style={{ color: '#fff' }}>Save</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* 🔹 EMPTY STATE */}
                {timetable.length === 0 && (
                    <Text>No timetable created</Text>
                )}

                {/* 🔹 GRID */}
                {days.map((day) => {
                    const dayData = timetable
                        .filter((t: any) => t.day === day)
                        .sort((a, b) => a.periodNumber - b.periodNumber);

                    return (
                        <View key={day} style={styles.dayCard}>

                            {/* DAY HEADER */}
                            <View style={styles.dayHeaderRow}>
                                <Text style={styles.dayTitle}>{day}</Text>

                                {/* ONE EDIT / DELETE PER DAY */}
                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity>
                                        <Text style={styles.editBtn}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity>
                                        <Text style={styles.deleteBtn}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* PERIOD LIST */}
                            {dayData.length > 0 ? (
                                dayData.map((item: any) => (
                                    <View key={item.id} style={styles.periodCard}>

                                        <Text style={styles.periodText}>
                                            P{item.periodNumber}
                                        </Text>

                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.subject}>
                                                {item.subject}
                                            </Text>
                                            <Text style={styles.subText}>
                                                Teacher ID: {item.teacher}
                                            </Text>
                                            <Text style={styles.subText}>
                                                Room no: {item.room}
                                            </Text>
                                        </View>

                                    </View>
                                ))
                            ) : (
                                <Text style={{ color: '#999' }}>
                                    No periods added
                                </Text>
                            )}
                        </View>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}

// 🔹 STYLES
const styles = StyleSheet.create({
    container: { padding: 16 },

    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10
    },

    addButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
        marginBottom: 10
    },

    form: {
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10
    },

    input: {
        borderWidth: 1,
        padding: 8,
        marginVertical: 5,
        borderRadius: 5
    },

    saveButton: {
        backgroundColor: 'green',
        padding: 10,
        alignItems: 'center',
        marginTop: 10,
        borderRadius: 5
    },

    dayBtn: {
        padding: 8,
        backgroundColor: '#eee',
        marginRight: 5,
        borderRadius: 5
    },

    activeDay: {
        backgroundColor: '#4CAF50'
    },
    gridContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc'
    },

    headerRow: {
        backgroundColor: '#e8f0fe'
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    dayHeader: {
        width: 80,
        fontWeight: 'bold',
        padding: 10
    },

    cellHeader: {
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold',
        padding: 10
    },

    cell: {
        flex: 1,
        borderWidth: 0.5,
        borderColor: '#ccc',
        padding: 8,
        alignItems: 'center',
        minHeight: 60
    },

    subjectText: {
        fontWeight: 'bold'
    },

    emptyText: {
        color: '#aaa'
    },

    actionHeader: {
        width: 80,
        textAlign: 'center',
        fontWeight: 'bold'
    },

    actionCell: {
        width: 80,
        alignItems: 'center'
    },

    editBtn: {
        color: 'blue',
        marginBottom: 5
    },
    dayCard: {
    backgroundColor: '#fff',
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    elevation: 2
    },

    dayHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },

    dayTitle: {
        fontSize: 16,
        fontWeight: 'bold'
    },

    periodCard: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8
    },

    periodText: {
        fontWeight: 'bold',
        marginRight: 10
    },

    subject: {
        fontWeight: 'bold'
    },

    subText: {
        fontSize: 12,
        color: '#555'
    },

        deleteBtn: {
            color: 'red'
        },
});