import { useState, useEffect } from "react";

// Type for a Subject
interface Subject {
  subject_id: number;
  name: string;
  max_marks: number;
}

// Props for the component
interface SubjectSelectorProps {
  examId: number; // id of the current exam
  onSubjectSelect: (subjectId: number) => void; // callback when a subject is selected
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ examId, onSubjectSelect }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/subjects?exam_id=${examId}`)
      .then(res => res.json())
      .then((data: Subject[]) => setSubjects(data))
      .catch(err => console.error("Error fetching subjects:", err));
  }, [examId]);

  return (
    <select 
      onChange={(e) => onSubjectSelect(Number(e.target.value))}
      defaultValue=""
      className="border p-2 rounded"
    >
      <option value="" disabled>
        Select Subject
      </option>
      {subjects.map((sub) => (
        <option key={sub.subject_id} value={sub.subject_id}>
          {sub.name}
        </option>
      ))}
    </select>
  );
};

export default SubjectSelector;
