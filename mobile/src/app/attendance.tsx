import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
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
  return (
    <View style={styles.container}>

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
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    padding: 20,
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
});