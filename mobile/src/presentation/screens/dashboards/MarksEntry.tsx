import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';

interface Student {
  id: number;
  name: string;
  rollNumber: string;
}

interface MarksEntryProps {
  subjectId: number;
  examId: number;
}

export default function MarksEntry({ subjectId, examId }: MarksEntryProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<number, number>>({});
  const [maxMarks, setMaxMarks] = useState<number>(100);

  useEffect(() => {
    if (subjectId) {
      fetch(`http://localhost:8000/api/v1/students?subject_id=${subjectId}`)
        .then(res => res.json())
        .then((data) => {
          // ✅ Ensure we always set an array
          if (Array.isArray(data)) {
            setStudents(data);
          } else if (Array.isArray(data.students)) {
            setStudents(data.students);
          } else {
            setStudents([]);
          }
        })
        .catch(err => console.error("Error fetching students:", err));
    }
  }, [subjectId]);

  const handleMarkChange = (studentId: number, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      if (num < 0 || num > maxMarks) {
        Alert.alert("Invalid Marks", `Marks must be between 0 and ${maxMarks}`);
        return;
      }
      setMarks(prev => ({ ...prev, [studentId]: num }));
    }
  };

  // ✅ Guard filter with Array.isArray
  const pendingCount = Array.isArray(students)
    ? students.filter(s => marks[s.id] === undefined).length
    : 0;

  const submitMarks = () => {
    const payload = Array.isArray(students)
      ? students.map(s => ({
          student_id: s.id,
          subject_id: subjectId,
          exam_id: examId,
          marks_obtained: marks[s.id] || 0
        }))
      : [];

    fetch(`http://localhost:8000/api/v1/marks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => Alert.alert('Success', 'Marks submitted successfully!'))
      .catch(() => Alert.alert('Error', 'Error submitting marks'));
  };

  return (
    <View>
      {Array.isArray(students) && (
        <FlatList
          data={students}
          keyExtractor={(s) => s.id.toString()}
          renderItem={({ item }) => (
            <View style={{ flexDirection: 'row', marginVertical: 5 }}>
              <Text style={{ flex: 1 }}>{item.rollNumber} - {item.name}</Text>
              <TextInput
                style={{ borderWidth: 1, width: 60, textAlign: 'center' }}
                keyboardType="numeric"
                value={marks[item.id]?.toString() || ''}
                onChangeText={(val) => handleMarkChange(item.id, val)}
              />
            </View>
          )}
        />
      )}
      <Text>Total Students: {students.length}</Text>
      <Text>Pending Entries: {pendingCount}</Text>
      <Button title="Submit Marks" onPress={submitMarks} />
    </View>
  );
}
