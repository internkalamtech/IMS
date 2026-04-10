import { View, Text, TextInput, ScrollView, Button, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import SummaryBar from '../../components/SummaryBar';

interface Subject {
  subject_id: number;
  name: string;
  max_marks: number;
}

interface Student {
  id: number;
  name: string;
  rollNumber: string;
}

export default function EnterMarksScreen() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<{ [key: number]: number }>({});

  const examId = 1;
  const maxMarks = 100;

  // ✅ Fetch subjects
  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/subjects?exam_id=${examId}`)
      .then(res => res.json())
      .then((data: Subject[]) => setSubjects(data))
      .catch(err => console.error("Error fetching subjects:", err));
  }, [examId]);

  // ✅ Fetch students when subject is selected
  useEffect(() => {
    if (selectedSubject === null) return;
    fetch(`http://localhost:8000/api/v1/students?subject_id=${selectedSubject}`)
      .then(res => res.json())
      .then((data: Student[]) => setStudents(data))
      .catch(err => console.error("Error fetching students:", err));
  }, [selectedSubject]);

  const pendingCount = students.filter(stu => marks[stu.id] === undefined).length;

  // ✅ Submit marks
  const handleSubmit = () => {
    if (selectedSubject === null) {
      Alert.alert("Select Subject", "Please select a subject first.");
      return;
    }
    if (pendingCount > 0) {
      Alert.alert("Incomplete", `You still have ${pendingCount} students pending.`);
      return;
    }

    const payload = students.map(stu => ({
      student_id: stu.id,
      marks_obtained: marks[stu.id],
      subject_id: selectedSubject,
      exam_id: examId,
    }));

    fetch('http://localhost:8000/api/v1/marks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to submit");
        return res.json();
      })
      .then(() => {
        Alert.alert("Success", "Marks submitted successfully!");
        setMarks({});
      })
      .catch(err => {
        console.error(err);
        Alert.alert("Error", "Failed to submit marks.");
      });
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Enter Marks</Text>

      {/* ✅ Subject Dropdown */}
      <Picker
        selectedValue={selectedSubject}
        onValueChange={(itemValue: number | null) => setSelectedSubject(itemValue)}
        style={{ height: 50, marginBottom: 20 }}
      >
        <Picker.Item label="Select Subject" value={null} />
        {subjects.map(sub => (
          <Picker.Item key={sub.subject_id} label={sub.name} value={sub.subject_id} />
        ))}
      </Picker>

      {/* ✅ Student List */}
      {students.map(stu => (
        <View
          key={stu.id}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
        >
          <Text style={{ width: 80 }}>{stu.rollNumber}</Text>
          <Text style={{ width: 120 }}>{stu.name}</Text>

          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              width: 60,
              padding: 5,
              textAlign: 'center',
            }}
            keyboardType="numeric"
            value={marks[stu.id]?.toString() || ''}
            onChangeText={(text) => {
              let value = Number(text);
              if (value < 0) value = 0;
              if (value > maxMarks) value = maxMarks;
              setMarks(prev => ({ ...prev, [stu.id]: value }));
            }}
          />
        </View>
      ))}

      {/* ✅ Summary */}
      <SummaryBar students={students} marks={marks} />

      {/* ✅ Submit Button */}
      <View style={{ marginTop: 20 }}>
        <Button title="Submit Marks" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}
