import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { useTheme } from "@/core/theme/ThemeContext";
import { getStudentMetricsUsecase } from '@/domain/usecases/get-student-metrics-usecase';
import { LinearGradient } from "expo-linear-gradient";  
import { Ionicons } from "@expo/vector-icons";
import { MOCK_STUDENTS } from "@/data/local/students";
import { useRoute } from "@react-navigation/native";
type Student = {
  id: string;
  name: string;
  roll: string;
  class: string;
  avatar: string;
  attendance: number;
  marks: number;
  rank: string;
};

export default function StudentDirectory() {
  const route = useRoute();
  const { student } = route.params as any;
  const [selectedClass, setSelectedClass] = useState("7B");
  const [showDropdown, setShowDropdown] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const toggleClass = () => {
    setSelectedClass((prev) => (prev === "7B" ? "7A" : "7B"));
  };

  const filtered = useMemo(() => {
    return MOCK_STUDENTS.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) &&
        s.roll.includes(search) &&
        s.class === selectedClass
    );
  }, [search, selectedClass]);
  const metrics = getStudentMetricsUsecase(
    filtered.map((s) => ({
    id: s.id,
    name: s.name,
    email: "", // placeholder
    role: "student",
    marks: s.marks,
    attendance: s.attendance,
  }))
);

  const renderItem = ({ item }: { item: Student }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.card }]}
     onPress={() =>
      router.push({
    pathname: "/student-profile",
    params: { id: item.id },
  })
}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />

      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { color: theme.colors.text }]}>
          {item.name}
        </Text>

        <Text style={{ opacity: 0.6 }}>
          Roll No: {item.roll}
        </Text>

        {/* Stats Row (matches prototype) */}
        <View style={styles.statsRow}>
          <Text>🎓 {item.marks}%</Text>
          <Text>🏆 {item.rank}</Text>
        </View>
      </View>

      {/* Attendance badge */}
      <View style={styles.badge}>
        <Text style={{ color: "#16a34a", fontWeight: "600" }}>
          {item.attendance}%
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex:1 }}>  
      
      {/* HEADER */}
      <LinearGradient
  colors={["#2563eb", "#1d4ed8"]}
  style={styles.headerContainer}
>
  {showDropdown && (
  <View style={styles.dropdown}>
    <FlatList
      data={["7A", "7B", "8A", "8B"]}
      keyExtractor={(item) => item}
      style={{ maxHeight: 180 }} 

      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.dropdownItem}
          onPress={() => {
            setSelectedClass(item);
            setShowDropdown(false);
          }}
        >
          <Text style={styles.dropdownTitle}>Class {item}</Text>
          <Text style={styles.dropdownSub}>Section A</Text>
        </TouchableOpacity>
      )}
    />
  </View>
)}

  {/* Top Row */}
  <View style={styles.headerTop}>
  {/* Back Arrow */}
  <TouchableOpacity onPress={() => router.back()}>
    <Ionicons name="arrow-back" size={22} color="#fff" />
  </TouchableOpacity>

  {/* Title */}
  <Text style={styles.headerTitle}>Students</Text>

  {/* Right placeholder (for alignment) */}
  <View style={{ width: 22 }} />
</View>

  {/* Class Selector */}
 <TouchableOpacity
  style={styles.classRow}
  onPress={() => setShowDropdown(prev => !prev)}
>
  <Text style={styles.classText}>
    Class {selectedClass} - Section A
  </Text>

  <Ionicons
    name={showDropdown ? "chevron-up" : "chevron-down"}
    size={16}
    color="#dbeafe"
    style={{ marginLeft: 4 }}
  />
</TouchableOpacity>
  {/* Search */}
  <TextInput
    placeholder="Search by name or roll number..."
    placeholderTextColor="#c7d2fe"
    value={search}
    onChangeText={setSearch}
    style={styles.headerSearch}
  />

</LinearGradient>
      
<View style={styles.summaryContainer}>
  <View style={styles.summaryCard}>
    <Text style={styles.summaryLabel}>Total Students</Text>
    <Text style={[styles.summaryValue, { color: "#111827" }]}>
  {metrics.totalStudents}
</Text>
  </View>

  <View style={styles.summaryCard}>
    <Text style={styles.summaryLabel}>Avg Marks</Text>
    <Text style={[styles.summaryValue, { color: "#2563eb" }]}>
  {metrics.avgMarks}%
</Text>
  </View>

  <View style={styles.summaryCard}>
    <Text style={styles.summaryLabel}>Avg Attendance</Text>
    <Text style={[styles.summaryValue, { color: "#16a34a" }]}>
  {metrics.avgAttendance}%
</Text>
  </View>
</View>
      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
          style={{ zIndex: 1 }} 
           ListEmptyComponent={
    <Text style={styles.emptyText}>No students found</Text>
  }
        contentContainerStyle={{ paddingBottom: 20, padding: 16,
        paddingTop: 20, flexGrow: 1 }}
        
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  header: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  search: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },

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
  summaryContainer: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 16,
  marginTop: 4,
},

summaryCard: {
  flex: 1,
  backgroundColor: "#f8fafc",
  paddingVertical: 16,
  borderRadius: 18,
  alignItems: "center",
  marginHorizontal: 6,
  elevation: 2, // Android shadow
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
},

summaryLabel: {
  fontSize: 12,
    color: "#6b7280", 
},

summaryValue: {
  fontSize: 18,
  fontWeight: "700",
  marginTop: 6,
  color: "#111827",

},
headerContainer: {
  paddingTop: 50,
  paddingHorizontal: 16,
  paddingBottom: 20,
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20,
},

headerTop: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 6,
},

headerTitle: {
  color: "#fff",
  fontSize: 20,
  fontWeight: "700",
},

classText: {
  color: "#dbeafe",
  marginTop: 4,
  marginBottom: 14,
},

headerSearch: {
  backgroundColor: "rgba(255,255,255,0.15)",
  borderRadius: 12,
  padding: 12,
  color: "#fff",
},
dropdown: {
  position: "absolute",
  top: 100, 
  left: 16,
  right: 16,
  backgroundColor: "#fff",
  borderRadius: 16,
  paddingVertical: 8,
  zIndex: 10,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 5,
},

dropdownItem: {
  paddingVertical: 12,
  paddingHorizontal: 16,
},

dropdownTitle: {
  fontWeight: "600",
  color: "#111",
},

dropdownSub: {
  fontSize: 12,
  color: "#6b7280",
},
classRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 4,
  marginBottom: 12,
},
overlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.2)", 
  zIndex: 50,
  justifyContent: "flex-start",
},

dropdownModal: {
  marginTop: 100, 
  marginHorizontal: 16,
  backgroundColor: "#fff",
  borderRadius: 16,
  maxHeight: 220,

  shadowColor: "#000",
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 6,
},
emptyText: {
  textAlign: "center",
  marginTop: 32,
  fontSize: 16,
  color: "#6b7280",
},
});