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

    // getting params from previous screen
    const { classId, className, section } = useLocalSearchParams();

    // state for timetable data
    const [timetable, setTimetable] = useState<any[]>([]);

    // form visibility
    const [showForm, setShowForm] = useState(false);

    // edit mode
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    // selected day
    const [selectedDay, setSelectedDay] = useState('Monday');

    // form fields
    const [subject, setSubject] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [roomId, setRoomId] = useState('');
    const [roomType, setRoomType] = useState('classroom');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [periodNumber, setPeriodNumber] = useState('');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // fetch timetable based on class id
    const fetchTimetable = async () => {
        try {
            const res = await fetch(
                `http://10.237.144.29:8000/api/v1/timetables/?class_id=${classId}`
            );
            const data = await res.json();

            setTimetable(Array.isArray(data) ? data : []);

        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchTimetable();
    }, [classId]);

    // convert time to minutes for overlap check
    const toMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    // check time overlap
    const isOverlap = (aStart: string, aEnd: string, bStart: string, bEnd: string) => {
        return toMinutes(aStart) < toMinutes(bEnd) &&
               toMinutes(bStart) < toMinutes(aEnd);
    };

    // validation logic

    const validate = () => {
        // Required field validation
        if (!subject || !teacherId || !roomId || !startTime || !endTime || !periodNumber) {
            Alert.alert("Error", "All fields are required");
            return false;
        }
        if (!periodNumber) {
            Alert.alert('Error', 'Enter period number');
            return false;
        }

        // prevent duplicate period in same class and day
        const duplicate = timetable.find(
            (t: any) =>
                t.day === selectedDay &&
                t.periodNumber === Number(periodNumber) &&
                t.id !== editId
        );

        if (duplicate) {
            Alert.alert('Error', 'Period already exists for this day');
            return false;
        }

        // teacher and room conflict with time overlap
        for (let t of timetable) {

            if (t.id === editId) continue;

            if (t.day === selectedDay &&
                isOverlap(startTime, endTime, t.startTime, t.endTime)) {

                if (t.teacher === teacherId) {
                    Alert.alert(
                        "Error",
                        `Teacher busy in class ${t.classId} (${t.startTime}-${t.endTime})`
                    );
                    return false;
                }

                if (t.room === roomId) {
                    Alert.alert(
                        "Error",
                        `Room already used (${t.startTime}-${t.endTime})`
                    );
                    return false;
                }
            }
        }

        // lab validation
        const isLabSubject = subject.toLowerCase().includes('lab');

        if (isLabSubject && roomType !== 'lab') {
            Alert.alert('Warning', 'Lab subject should be assigned to lab room');
            return false;
        }

        return true;
    };

    // save timetable
    const handleSave = async () => {

        if (!validate()) return;

        const payload = {
            classId: Number(classId),
            subject,
            teacher: teacherId,
            room: roomId,
            day: selectedDay,
            startTime,
            endTime,
            periodNumber: Number(periodNumber),
            roomType
        };

        try {
            let res;

            if (editMode && editId) {
                res = await fetch(
                    `http://10.237.144.29:8000/api/v1/timetables/${editId}`,
                    {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    }
                );
            } else {
                res = await fetch(
                    `http://10.237.144.29:8000/api/v1/timetables/`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    }
                );
            }

            const data = await res.json();

            // 🔥 THIS IS THE FIX
            if (!res.ok) {
                Alert.alert("Error", data.detail || "Something went wrong");
                return;
            }

            Alert.alert(editMode ? "Updated" : "Added");

            setShowForm(false);
            setEditMode(false);
            setEditId(null);

            fetchTimetable();

        } catch (err) {
            console.log(err);
        }
    };

    // delete single period
    const handleDelete = async (id: number) => {
        await fetch(`http://10.237.144.29:8000/api/v1/timetables/${id}`, {
            method: 'DELETE',
        });
        fetchTimetable();
    };

    // delete entire day
    const handleDeleteDay = async (day: string) => {
        const dayItems = timetable.filter((t: any) => t.day === day);

        for (let item of dayItems) {
            await fetch(`http://10.237.144.29:8000/api/v1/timetables/${item.id}`, {
                method: 'DELETE',
            });
        }

        fetchTimetable();
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={styles.container}>

               <Text style={styles.title}>
                    Timetable : {className} {section ? `- ${section}` : ''}
                </Text>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        setShowForm(!showForm);
                        setEditMode(false);
                    }}
                >
                    <Text style={{ color: '#fff' }}>Add</Text>
                </TouchableOpacity>

                {showForm && (
                    <View style={styles.form}>

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

                        <TextInput placeholder="Subject" style={styles.input} onChangeText={setSubject} />
                        <TextInput placeholder="Teacher ID" style={styles.input} onChangeText={setTeacherId} />
                        <TextInput placeholder="Room ID" style={styles.input} onChangeText={setRoomId} />
                        <TextInput placeholder="Room Type classroom or lab" style={styles.input} onChangeText={setRoomType} />
                        <TextInput placeholder="Period Number" style={styles.input} value={periodNumber} onChangeText={setPeriodNumber} />
                        <TextInput placeholder="Start Time 09:00" style={styles.input} onChangeText={setStartTime} />
                        <TextInput placeholder="End Time 10:00" style={styles.input} onChangeText={setEndTime} />

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={{ color: '#fff' }}>Save</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {timetable.length === 0 && (
                    <Text>No timetable created</Text>
                )}

                {days.map((day) => {

                    const dayData = timetable
                        .filter((t: any) => t.day === day)
                        .sort((a, b) => a.periodNumber - b.periodNumber);

                    return (
                        <View key={day} style={styles.dayCard}>

                            <View style={styles.dayHeaderRow}>
                                <Text style={styles.dayTitle}>{day}</Text>

                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity onPress={() => {
                                        setSelectedDay(day);
                                        setShowForm(true);
                                        setEditMode(false);
                                    }}>
                                        <Text style={{ color: 'blue', marginRight: 10 }}>Edit</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => handleDeleteDay(day)}>
                                        <Text style={{ color: 'red' }}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {dayData.map((item: any) => (
                                <View key={item.id} style={styles.periodCard}>

                                    <Text style={styles.periodText}>
                                        P{item.periodNumber}
                                    </Text>

                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.subject}>{item.subject}</Text>
                                        <Text style={styles.subText}>Teacher {item.teacher}</Text>
                                        <Text style={styles.subText}>Room {item.room}</Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => {

                                            // enable edit mode
                                            setEditMode(true);
                                            setEditId(item.id);

                                            // fill form with selected period data
                                            setSubject(item.subject);
                                            setTeacherId(item.teacher);
                                            setRoomId(item.room);
                                            setStartTime(item.startTime);
                                            setEndTime(item.endTime);
                                            setPeriodNumber(item.periodNumber.toString());
                                            setSelectedDay(item.day);

                                            // show form
                                            setShowForm(true);
                                        }}
                                    >
                                        <Text style={{ color: 'purple', marginRight: 10 }}>
                                            Edit
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                        <Text style={{ color: 'red' }}>Delete</Text>
                                    </TouchableOpacity>

                                </View>
                            ))}
                        </View>
                    );
                })}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    title: { fontSize: 20, fontWeight: 'bold' },

    addButton: {
        backgroundColor: '#007bff',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
        alignItems: 'center'
    },

    form: { backgroundColor: '#f5f5f5', padding: 10, borderRadius: 8 },

    input: { borderWidth: 1, padding: 8, marginVertical: 5 },

    saveButton: {
        backgroundColor: 'green',
        padding: 10,
        alignItems: 'center',
        marginTop: 10
    },

    dayBtn: { padding: 8, backgroundColor: '#eee', marginRight: 5 },
    activeDay: { backgroundColor: '#4CAF50' },

    dayCard: {
        backgroundColor: '#fff',
        marginTop: 10,
        padding: 10,
        borderRadius: 8
    },

    dayHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    dayTitle: { fontWeight: 'bold' },

    periodCard: {
        flexDirection: 'row',
        marginTop: 8,
        backgroundColor: '#f9f9f9',
        padding: 8
    },

    periodText: { marginRight: 10, fontWeight: 'bold' },

    subject: { fontWeight: 'bold' },

    subText: { fontSize: 12 },

    deleteBtn: { color: 'red' }
});