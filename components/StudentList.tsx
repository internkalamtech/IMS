import React, { useState, useEffect } from "react";

interface Student {
  id: number;
  name: string;
  rollNumber: string;
}

interface StudentListProps {
  subjectId: number;
  onMarksChange: (studentId: number, marks: number) => void;
  maxMarks: number;
}

const StudentList: React.FC<StudentListProps> = ({ subjectId, onMarksChange, maxMarks }) => {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (!subjectId) return;
    fetch(`http://localhost:8000/api/v1/students?subject_id=${subjectId}`)
      .then(res => res.json())
      .then((data: Student[]) => setStudents(data))
      .catch(err => console.error("Error fetching students:", err));
  }, [subjectId]);

  return (
    <div>
      {students.map((stu) => (
        <div key={stu.id} style={{ display: "flex", marginBottom: "8px" }}>
          <span style={{ width: "100px" }}>{stu.rollNumber}</span>
          <span style={{ width: "150px" }}>{stu.name}</span>
          <input
            type="number"
            min={0}
            max={maxMarks}
            onChange={(e) => onMarksChange(stu.id, Number(e.target.value))}
            style={{ width: "60px", textAlign: "center" }}
          />
        </div>
      ))}
    </div>
  );
};

export default StudentList;
