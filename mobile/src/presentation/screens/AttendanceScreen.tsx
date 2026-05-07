import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Alert } from "react-native";
import { ColorPalettes } from '@/core/theme/tokens';
import StudentProfile from "./StudentProfileScreen"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
} from "react-native";
import { useTheme } from "@/core/theme/ThemeContext";

type Status = "Present" | "Absent" | "Leave";

type Student = {
  id: string;
  name: string;
  roll: string;
  status: Status;
};

const MOCK_STUDENTS: Student[] = [
  { id: "1", name: "Emma Wilson", roll: "001", status: "Present" },
  { id: "2", name: "Liam Johnson", roll: "002", status: "Present" },
  { id: "3", name: "Olivia Brown", roll: "003", status: "Leave" },
  { id: "4", name: "Noah Davis", roll: "004", status: "Present" },
  { id: "5", name: "Ava Martinez", roll: "005", status: "Absent" },
];

export default function AttendanceScreen() {
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [search, setSearch] = useState("");
   const [showConfirm, setShowConfirm] = useState(false);
   const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { theme } = useTheme();
if (selectedStudent) {
  return (
    <StudentProfile
      student={{
        name: selectedStudent.name,
        roll: selectedStudent.roll,
        class: "7B",
        attendance: "93.3%",
        marks: "87.2%",
        rank: "#5",
      }}
      onBack={() => setSelectedStudent(null)}
    />
  );
}
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll.includes(search)
  );

  
  const summary = {
    total: students.length,
    present: students.filter((s) => s.status === "Present").length,
    absent: students.filter((s) => s.status === "Absent").length,
    leave: students.filter((s) => s.status === "Leave").length,
  };
const handleStatusChange = (id: string, status: Status) => {
  const updated = students.map((s) =>
    s.id === id ? { ...s, status } : s
  );
  setStudents(updated);
};
const handleSubmit = async () => {
  try {
    for (const student of students) {
      await fetch("http://127.0.0.1:8000/api/v1/attendance/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: Number(student.id),
          class_name: "Grade 6-A",
          subject: "Math",
          date: new Date().toISOString(),
          status: student.status.toLowerCase(), // IMPORTANT
          teacher_id: 1,
        }),
      });
    }

    Alert.alert("Success", "Attendance submitted successfully!");
  } catch (error) {
    console.log(error);
    Alert.alert("Error", "Failed to submit attendance");
  }
};
const today = new Date().toLocaleDateString("en-GB");
const CLASS_INFO = "Class 7B - Mathematics";
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance</Text>
        <Text>{CLASS_INFO}</Text>
        <View style={styles.dateBox}>
       <Ionicons name="calendar-outline" size={18} color="#fff" />
       <Text> {today} </Text>
              </View>

        <TextInput
          placeholder="Search by name or roll number..."
          placeholderTextColor="#cfe3ff"
          style={styles.search}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* SUMMARY */}
      <View style={styles.summaryContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total</Text>
          <Text style={styles.cardValue}>{summary.total}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Present</Text>
          <Text style={[styles.cardValue, { color: ColorPalettes.emerald[500] }]}>
            {summary.present}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Absent</Text>
          <Text style={[styles.cardValue, { color: ColorPalettes.red[500] }]}>
            {summary.absent}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Leave</Text>
          <Text style={[styles.cardValue, { color: ColorPalettes.amber[500] }]}>
            {summary.leave}
          </Text>
        </View>
      </View>

  {/* STUDENT LIST */}
  <FlatList
    data={filteredStudents}
    keyExtractor={(item) => item.id}
    contentContainerStyle={{ padding: 15 }}
    renderItem={({ item }) => (
      <View style={styles.studentCard}>
       <TouchableOpacity onPress={() => setSelectedStudent(item)}>
  <Text style={styles.name}>{item.name}</Text>
  <Text style={styles.roll}>Roll No: {item.roll}</Text>
</TouchableOpacity>
        <View style={styles.actions}>
  
  {/* Present */}
  <TouchableOpacity
    style={[
      styles.iconBtn,
      item.status === "Present"
        ? { backgroundColor: ColorPalettes.emerald[500] }
        : styles.inactiveBtn,
    ]}
      onPress={handleSubmit}  >
    <Ionicons
      name="checkmark"
      size={20}
      color={item.status === "Present" ? "#fff" : "#000"}
    />
  </TouchableOpacity>

  {/* Absent */}
  <TouchableOpacity
    style={[
      styles.iconBtn,
      item.status === "Absent"
        ? { backgroundColor: ColorPalettes.red[500] }
        : styles.inactiveBtn,
    ]}
    onPress={() => handleStatusChange(item.id, "Absent")}
  >
    <Ionicons
      name="close"
      size={20}
      color={item.status === "Absent" ? "#fff" : "#000"}
    />
  </TouchableOpacity>

  {/* Leave */}
  <TouchableOpacity
    style={[
      styles.iconBtn,
      item.status === "Leave"
        ? { backgroundColor: ColorPalettes.amber[500] }
        : styles.inactiveBtn,
    ]}
    onPress={() => handleStatusChange(item.id, "Leave")}
  >
    <Ionicons
      name="document-text-outline"
      size={20}
      color={item.status === "Leave" ? "#fff" : "#666"}
    />
  </TouchableOpacity>

</View>
      </View>
    )}
  />
{showConfirm && (
  <View style={styles.modalOverlay}>
    <View style={styles.modalBox}>
      <Text style={styles.modalTitle}>Confirm Submission</Text>
      <Text style={styles.modalText}>
        Are you sure you want to submit attendance?
      </Text>

      <View style={styles.modalActions}>
        <TouchableOpacity onPress={() => setShowConfirm(false)}>
          <Text style={styles.cancelBtn}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setShowConfirm(false);
            console.log("Attendance submitted", students);
          }}
        >
          <Text style={styles.submitConfirmBtn}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
)}
  <View style={styles.submitContainer}>
  <TouchableOpacity
  style={styles.submitBtn}
  onPress={() => setShowConfirm(true)}
>
  <Text style={styles.submitText}>
    Submit Attendance ({summary.present + summary.absent + summary.leave}/{students.length})
  </Text>
</TouchableOpacity>
</View>
</View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f4f7",
  },

  submitContainer: {
  position: "absolute",
  bottom: 10,
  left: 0,
  right: 0,
  alignItems: "center",
},

submitBtn: {
  backgroundColor: "#1e6be3",
  paddingVertical: 15,
  paddingHorizontal: 30,
  borderRadius: 25,
},

iconBtn: {
  width: 40,
  height: 40,
  borderRadius: 12,
  justifyContent: "center",
  alignItems: "center",
},

inactiveBtn: {
  backgroundColor: "#f2f4f7",
  borderWidth: 1,
  borderColor: "#d1d5db",
},

submitText: {
  color: "#fff",
  fontWeight: "bold",
  textAlign: "center",
},
  header: {
    backgroundColor: "#1e6be3",
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  dateBox: {
  marginTop: 15,
  backgroundColor: "#2d7df6",
  padding: 12,
  borderRadius: 10,
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
},

modalOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
},

modalBox: {
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 15,
  width: "80%",
},

modalTitle: {
  fontWeight: "bold",
  fontSize: 16,
  marginBottom: 10,
},

modalText: {
  marginBottom: 20,
},

modalActions: {
  flexDirection: "row",
  justifyContent: "flex-end",
  gap: 20,
},

cancelBtn: {
  color: "gray",
},

submitConfirmBtn: {
  color: "#1e6be3",
  fontWeight: "bold",
},

  search: {
    marginTop: 15,
    backgroundColor: "#2d7df6",
    padding: 12,
    borderRadius: 10,
    color: "#fff",
  },

  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingHorizontal: 15,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    width: "23%",
    alignItems: "center",
    elevation: 3,
  },

  cardTitle: {
    fontSize: 12,
    color: "#666",
  },

  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },

  studentCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontWeight: "bold",
  },

  roll: {
    color: "#666",
  },

  actions: {
  flexDirection: "row",
  gap: 10,
},

btn: {
  width: 35,
  height: 35,
  borderRadius: 10,
  textAlign: "center",
  textAlignVertical: "center",
  backgroundColor: "#eee",
  fontWeight: "bold",
},
});