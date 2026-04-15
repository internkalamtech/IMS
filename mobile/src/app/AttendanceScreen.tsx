import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Calendar } from "react-native-calendars";
import { Picker } from "@react-native-picker/picker";

export default function AttendanceScreen() {

  const [selectedClass, setSelectedClass] = useState("10-A");
 const attendanceDataByClass: Record<string, Record<string, string>> = {
  "8-A": {
    "2026-01-03": "present",
    "2026-01-05": "present",
    "2026-01-07": "absent",
  },

  "8-B": {
    "2026-01-02": "present",
    "2026-01-04": "late",
    "2026-01-09": "present",
  },

  "9-A": {
    "2026-01-01": "present",
    "2026-01-06": "absent",
    "2026-01-10": "present",
  },

  "9-B": {
    "2026-01-02": "present",
    "2026-01-06": "present",
    "2026-01-08": "absent",
  },

  "10-A": {
    "2026-01-03": "present",
    "2026-01-05": "absent",
    "2026-01-07": "present",
  },

  "10-B": {
    "2026-01-04": "present",
    "2026-01-08": "late",
    "2026-01-11": "present",
  },
  };
  const studentsByClass: Record<string, Array<{id: string, name: string, rollNo: string}>> = {
  "8-A": [
    { id: "1", name: "Aarav Kumar", rollNo: "01" },
    { id: "2", name: "Priya Singh", rollNo: "02" },
    { id: "3", name: "Rohan Patel", rollNo: "03" },
  ],
  "8-B": [
    { id: "4", name: "Ananya Rao", rollNo: "01" },
    { id: "5", name: "Vikram Sharma", rollNo: "02" },
  ],
  "9-A": [
    { id: "6", name: "Sneha Gupta", rollNo: "01" },
    { id: "7", name: "Arjun Verma", rollNo: "02" },
  ],
  "9-B": [
    { id: "8", name: "Divya Nair", rollNo: "01" },
    { id: "9", name: "Karan Singh", rollNo: "02" },
  ],
  "10-A": [
    { id: "10", name: "Emma Wilson", rollNo: "01" },
    { id: "11", name: "Liam Johnson", rollNo: "02" },
    { id: "12", name: "Sophia Brown", rollNo: "03" },
  ],
  "10-B": [
    { id: "13", name: "Olivia Davis", rollNo: "01" },
    { id: "14", name: "Noah Martinez", rollNo: "02" },
  ],
};
const studentAttendanceByClass: Record<string, Record<string, Record<string, string>>> = {
  "8-A": {
    "1": { // Aarav
      "2026-01-03": "present",
      "2026-01-05": "present",
      "2026-01-07": "absent",
      "2026-01-09": "present",
      "2026-01-12": "present",
      "2026-01-14": "present",
    },
    "2": { // Priya - HIGH attendance
      "2026-01-03": "present",
      "2026-01-05": "present",
      "2026-01-07": "present",
      "2026-01-09": "present",
      "2026-01-12": "present",
      "2026-01-14": "present",
    },
    "3": { // Rohan - LOW attendance
      "2026-01-03": "absent",
      "2026-01-05": "absent",
      "2026-01-07": "present",
      "2026-01-09": "absent",
      "2026-01-12": "present",
      "2026-01-14": "absent",
    },
  },
  "10-A": {
    "10": { // Emma - HIGH
      "2026-01-03": "present",
      "2026-01-05": "present",
      "2026-01-07": "present",
      "2026-01-09": "present",
      "2026-01-12": "present",
    },
    "11": { // Liam - LOW
      "2026-01-03": "absent",
      "2026-01-05": "absent",
      "2026-01-07": "present",
      "2026-01-09": "absence",
      "2026-01-12": "present",
    },
    "12": { // Sophia - MEDIUM
      "2026-01-03": "present",
      "2026-01-05": "absent",
      "2026-01-07": "present",
      "2026-01-09": "present",
      "2026-01-12": "present",
    },
  },
  // Add similar data for other classes...
};
  const attendanceData = attendanceDataByClass[selectedClass] || {};
const totalDays = Object.keys(attendanceData).length;

const presentDays = Object.values(attendanceData)
  .filter((status) => status === "present").length;

const absentDays = Object.values(attendanceData)
  .filter((status) => status === "absent").length;

const percentage = totalDays
  ? Math.round((presentDays / totalDays) * 100)
  : 0;
const markedDates = Object.keys(attendanceData).reduce((acc: any, date) => {
  const status = attendanceData[date];

  let backgroundColor = "#4CAF50"; // present

  if (status === "absent") backgroundColor = "#F44336";
  if (status === "late") backgroundColor = "#FFC107";

  acc[date] = {
    customStyles: {
      container: {
        backgroundColor,
        borderRadius: 6,
      },
      text: {
        color: "white",
        fontWeight: "bold",
      },
    },
  };

  return acc;
}, {});
// Calculate attendance percentage for a student
const calculateStudentAttendance = (classId: string, studentId: string) => {
  const studentData = studentAttendanceByClass[classId]?.[studentId] || {};
  const totalDays = Object.keys(studentData).length;
  const presentDays = Object.values(studentData).filter(s => s === "present").length;
  return totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
};

// Get color badge based on attendance percentage
const getAttendanceBadgeColor = (percentage: number) => {
  if (percentage > 90) return { bg: "#E8F5E9", text: "#2E7D32", border: "#4CAF50" }; // Green
  if (percentage < 75) return { bg: "#FFEBEE", text: "#C62828", border: "#F44336" }; // Red
  return { bg: "#FFF3E0", text: "#E65100", border: "#FF9800" }; // Orange/Yellow
};

const currentClassStudents = studentsByClass[selectedClass] || [];
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true} contentContainerStyle={styles.scrollContent}>

      <Text style={styles.title}>Attendance</Text>

      {/* Class Selector */}
      <View style={styles.selector}>
        <Text style={styles.label}>Select Class</Text>

       <Picker
  selectedValue={selectedClass}
  onValueChange={(itemValue) => setSelectedClass(itemValue)}
>
  <Picker.Item label="Class 8-A" value="8-A" />
  <Picker.Item label="Class 8-B" value="8-B" />
  <Picker.Item label="Class 9-A" value="9-A" />
  <Picker.Item label="Class 9-B" value="9-B" />
  <Picker.Item label="Class 10-A" value="10-A" />
  <Picker.Item label="Class 10-B" value="10-B" />
</Picker>
      </View>
      <View style={styles.summaryCard}>
  <Text style={styles.summaryTitle}>
  {new Date().toLocaleString("default", { month: "long" })} Attendance
</Text>

  <View style={styles.summaryRow}>
    <View>
      <Text style={styles.summaryValue}>{percentage}%</Text>
      <Text style={styles.summaryLabel}>Attendance</Text>
    </View>

    <View>
      <Text style={styles.summaryValue}>{absentDays}</Text>
      <Text style={styles.summaryLabel}>Missed Days</Text>
    </View>
  </View>
</View>
<View style={styles.studentListContainer}>
  <Text style={styles.studentListTitle}>Student Attendance</Text>
  {currentClassStudents.map((student) => {
    const attPercentage = calculateStudentAttendance(selectedClass, student.id);
    const badgeColor = getAttendanceBadgeColor(attPercentage);
    
    return (
      <View key={student.id} style={styles.studentCard}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.rollNo}>Roll: {student.rollNo}</Text>
        </View>
        <View style={[styles.attendanceBadge, { backgroundColor: badgeColor.bg, borderColor: badgeColor.border }]}>
          <Text style={[styles.attendancePercentage, { color: badgeColor.text }]}>
            {attPercentage}%
          </Text>
        </View>
      </View>
    );
  })}
</View>
      {/* Calendar */}
     <Calendar
  initialDate={"2026-01-01"}
  markingType="custom"
  markedDates={markedDates}
  enableSwipeMonths={true}
  style={styles.calendar}
/>
<View style={styles.legend}>
  <Text style={styles.legendText}>🟢 Present   🔴 Absent   🟡 Late</Text>
</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    backgroundColor: "#F6F7FB",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  selector: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },

  label: {
    fontWeight: "600",
    marginBottom: 5,
  },
 calendar: {
  borderRadius: 14,
  paddingBottom: 10,
  elevation: 3,
  backgroundColor: "white",
},
summaryCard: {
  backgroundColor: "white",
  padding: 18,
  borderRadius: 14,
  marginBottom: 20,
  elevation: 2,
},

summaryTitle: {
  fontSize: 16,
  fontWeight: "600",
  marginBottom: 10,
},

summaryRow: {
  flexDirection: "row",
  justifyContent: "space-between",
},

summaryValue: {
  fontSize: 28,
  fontWeight: "bold",
  color: "#4CAF50",
},

summaryLabel: {
  fontSize: 13,
  color: "#666",
},

legend: {
  marginTop: 12,
  alignItems: "center",
},

legendText: {
  fontSize: 14,
  color: "#555",
},
studentListContainer: {
  marginBottom: 20,
  backgroundColor: "white",
  borderRadius: 14,
  padding: 15,
  elevation: 2,
},

studentListTitle: {
  fontSize: 16,
  fontWeight: "600",
  marginBottom: 12,
  color: "#333",
},

studentCard: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 12,
  paddingHorizontal: 12,
  marginBottom: 8,
  backgroundColor: "#F9F9F9",
  borderRadius: 10,
  borderLeftWidth: 4,
  borderLeftColor: "#2196F3",
},

studentInfo: {
  flex: 1,
},

studentName: {
  fontSize: 14,
  fontWeight: "600",
  color: "#333",
  marginBottom: 3,
},

rollNo: {
  fontSize: 12,
  color: "#999",
},

attendanceBadge: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 8,
  borderWidth: 1.5,
  justifyContent: "center",
  alignItems: "center",
},

attendancePercentage: {
  fontWeight: "bold",
  fontSize: 13,
},
});