import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { useTheme } from "@/core/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

type Student = {
  id: string;
  name: string;
  roll: string;
  class: string;
  avatar: string;
  attendance: string;
  marks: string;
  rank: string;
};

const MOCK_STUDENTS: Student[] = [
  {
    id: "1",
    name: "Emma Wilson",
    roll: "001",
    class: "7B",
    avatar: "https://i.pravatar.cc/150?img=1",
    attendance: "93.3%",
    marks: "87.2%",
    rank: "#5",
  },
  {
    id: "2",
    name: "Liam Johnson",
    roll: "002",
    class: "7B",
    avatar: "https://i.pravatar.cc/150?img=2",
    attendance: "89.5%",
    marks: "82.4%",
    rank: "#12",
  },
];

export default function StudentDirectory() {
  const { theme } = useTheme();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [selectedClass, setSelectedClass] = useState("7B");
  const filtered = useMemo(() => {
  return MOCK_STUDENTS.filter(
    (s) =>
      s.class === selectedClass &&
      (s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.roll.includes(search))
  );
}, [search, selectedClass]);
const classOptions = [
  { className: "7A", section: "Section A" },
  { className: "7B", section: "Section A" },
  { className: "8A", section: "Section A" },
  { className: "8B", section: "Section A" },
];
const classStudents = useMemo(() => {
  return MOCK_STUDENTS.filter((student) => student.class === selectedClass);
}, [selectedClass]);

const totalStudents = classStudents.length;
const avgMarks =
  classStudents.length > 0
    ? (
        classStudents.reduce(
          (sum, student) => sum + Number(student.marks.replace("%", "")),
          0
        ) / classStudents.length
      ).toFixed(1)
    : "0.0";

    const avgAttendance =
  classStudents.length > 0
    ? (
        classStudents.reduce(
          (sum, student) => sum + Number(student.attendance.replace("%", "")),
          0
        ) / classStudents.length
      ).toFixed(1)
    : "0.0";

  const renderItem = ({ item }: { item: Student }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.card }]}
     onPress={() =>
  router.push({
    pathname: "/student-profile",
    params: {
      name: item.name,
      roll: item.roll,
      class: item.class,
      attendance: item.attendance,
      marks: item.marks,
      rank: item.rank,
    },
  })
}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />

      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { color: theme.colors.foreground }]}>
          {item.name}
        </Text>

        <Text style={{ opacity: 0.6 }}>
          Roll No: {item.roll}
        </Text>

        {/* Stats Row (matches prototype) */}
        <View style={styles.statsRow}>
          <Text>🎓 {item.marks}</Text>
          <Text>🏆 {item.rank}</Text>
        </View>
      </View>

      {/* Attendance badge */}
      <View style={styles.badge}>
        <Text style={{ color: "#16a34a", fontWeight: "600" }}>
          {item.attendance}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* HEADER */}
      <View style={styles.blueHeader}>
  <View style={styles.headerRow}>
    <TouchableOpacity onPress={() => router.back()}>
      <Text style={styles.backArrow}>←</Text>
    </TouchableOpacity>

    <View style={{ flex: 1 }}>
  <Text style={styles.headerTitle}>Students</Text>

  <TouchableOpacity
    style={styles.classButton}
    onPress={() => setShowClassDropdown(!showClassDropdown)}
    activeOpacity={0.8}
  >
    <Text style={styles.classText}>
      Class {selectedClass} - Section A
    </Text>

    <Ionicons
      name={showClassDropdown ? "chevron-up" : "chevron-down"}
      size={18}
      color="#dbeafe"
    />
  </TouchableOpacity>
</View>

    <Text style={styles.headerIcon}>👥</Text>
  </View>
  {showClassDropdown && (
  <View style={styles.classDropdown}>
    {classOptions.map((option) => (
      <TouchableOpacity
        key={option.className}
        style={[
          styles.classOption,
          selectedClass === option.className && styles.selectedClassOption,
        ]}
        onPress={() => {
          setSelectedClass(option.className);
          setShowClassDropdown(false);
        }}
      >
        <Text style={styles.classOptionTitle}>
          Class {option.className}
        </Text>
        <Text style={styles.classOptionSubtitle}>
          {option.section}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
)}
        {/* SEARCH */}

  <TextInput
    placeholder="Search by name or roll number..."
    placeholderTextColor="#bfdbfe"
    value={search}
    onChangeText={setSearch}
    style={styles.headerSearch}
  />
</View>
<View style={styles.summaryRow}>
  <View style={styles.summaryCard}>
    <Text style={styles.summaryLabel}>Total</Text>
    <Text style={styles.totalValue}>{totalStudents}</Text>
  </View>

  <View style={styles.summaryCard}>
    <Text style={styles.summaryLabel}>Avg Marks</Text>
    <Text style={styles.marksValue}>{avgMarks}</Text>
  </View>

  <View style={styles.summaryCard}>
    <Text style={styles.summaryLabel}>Avg Att.</Text>
    <Text style={styles.attendanceValue}>{avgAttendance}%</Text>
  </View>
</View>
      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },

  name: {
    fontSize: 15,
    fontWeight: "600",
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },

  badge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
    summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  summaryCard: {
    width: "31%",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  summaryLabel: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 16,
  },

  totalValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  marksValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563eb",
  },

  attendanceValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#16a34a",
  },
    blueHeader: {
    backgroundColor: "#2563eb",
    paddingTop: 42,
    paddingHorizontal: 22,
    paddingBottom: 24,
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 24,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  backArrow: {
    color: "#fff",
    fontSize: 26,
    marginRight: 18,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  classText: {
    color: "#dbeafe",
    fontSize: 15,
    marginTop: 4,
  },

  headerIcon: {
    color: "#fff",
    fontSize: 24,
  },

  headerSearch: {
    backgroundColor: "#3b82f6",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    color: "#fff",
    fontSize: 15,
  },
  classButton: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  marginTop: 4,
},
  classDropdown: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    maxHeight: 260,
  },

  classOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },

  selectedClassOption: {
    backgroundColor: "#eef4ff",
  },

  classOptionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  classOptionSubtitle: {
    fontSize: 15,
    color: "#6b7280",
  },
});