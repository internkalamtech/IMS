import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ThemedText } from "@/presentation/components/ThemedText";
import { ThemedCard } from "@/presentation/components/ThemedCard";

// ✅ Props for exam and subject selection
type ExamSubjectsProps = {
  onExamSelect?: (examId: number) => void;
  onSubjectSelect?: (subjectId: number) => void;
};

export default function ExamSubjects({ onExamSelect, onSubjectSelect }: ExamSubjectsProps) {
  const [examId, setExamId] = useState<string>("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");

  useEffect(() => {
    if (examId) {
      fetch(`http://localhost:8000/api/v1/subjects?exam_id=${examId}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setSubjects(data);
          } else {
            setSubjects([]);
          }
        })
        .catch((err) => console.error("Error fetching subjects:", err));

      if (onExamSelect) onExamSelect(Number(examId));
    }
  }, [examId, onExamSelect]);

  useEffect(() => {
    if (selectedSubjectId && onSubjectSelect) {
      onSubjectSelect(Number(selectedSubjectId));
    }
  }, [selectedSubjectId, onSubjectSelect]);

  return (
    <View style={{ marginVertical: 20 }}>
      <ThemedText type="subtitle">Select Exam</ThemedText>
      <Picker selectedValue={examId} onValueChange={(value) => setExamId(value)}>
        <Picker.Item label="-- Choose Exam --" value="" />
        <Picker.Item label="Midterm Exam" value="1" />
        <Picker.Item label="Final Exam" value="2" />
        {/* Later: fetch exams dynamically */}
      </Picker>

      <ThemedCard style={{ marginTop: 16 }} padding={16}>
        <ThemedText type="subtitle">Subjects</ThemedText>
        {subjects.length > 0 ? (
          <Picker
            selectedValue={selectedSubjectId}
            onValueChange={(value) => setSelectedSubjectId(value)}
          >
            <Picker.Item label="-- Choose Subject --" value="" />
            {subjects.map((sub) => (
              <Picker.Item
                key={sub.subject_id}
                label={`${sub.name} (Max Marks: ${sub.max_marks})`}
                value={sub.subject_id.toString()}
              />
            ))}
          </Picker>
        ) : (
          <ThemedText>No subjects found. Select an exam above.</ThemedText>
        )}
      </ThemedCard>
    </View>
  );
}
