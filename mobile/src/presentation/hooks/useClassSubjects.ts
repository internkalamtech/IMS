import { useEffect, useState } from "react";
import { SubjectRepositoryImpl } from "@/data/repositories/SubjectRepositoryImpl";

export interface Subject {
  id?: number;
  name: string;
}

export const useClassSubjects = (classId: number) => {
  const repo = new SubjectRepositoryImpl();

  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);

  const fetchSubjects = async () => {
    try {
      const data = await repo.getAvailableSubjects();
      setAvailableSubjects(data);
      console.log("Fetched subjects:", data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchSubjects();
  }, []);

  const saveSubjects = async () => {
    try {
      await repo.updateClassSubjects(classId, selectedSubjects);
      alert("Saved successfully ✅");

      // Clear after save
      setSelectedSubjects([]);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  return {
    availableSubjects,
    selectedSubjects,
    setSelectedSubjects,
    saveSubjects,
  };
};
