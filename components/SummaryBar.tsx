import React from "react";

interface Student {
  id: number;
  name: string;
  rollNumber: string;
}

interface SummaryBarProps {
  students: Student[];
  marks: { [key: number]: number };
}

const SummaryBar: React.FC<SummaryBarProps> = ({ students, marks }) => {
  const total = students.length;
  const entered = Object.keys(marks).length;
  const pending = total - entered;

  return (
    <div style={{ marginTop: "20px" }}>
      <p>Total Students: {total}</p>
      <p>Marks Entered: {entered}</p>
      <p>Pending Entries: {pending}</p>
    </div>
  );
};

export default SummaryBar;
