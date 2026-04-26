import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { useTheme } from "@/core/theme/ThemeContext";

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

  const filtered = useMemo(() => {
    return MOCK_STUDENTS.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.roll.includes(search)
    );
  }, [search]);

  const renderItem = ({ item }: { item: Student }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.card }]}
     onPress={() =>
  router.push({
    pathname: "/student-profile" as any,
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
      <Text style={[styles.header, { color: theme.colors.foreground }]}>
        Students
      </Text>

      {/* SEARCH */}
      <TextInput
        placeholder="Search by name or roll..."
        value={search}
        onChangeText={setSearch}
        style={[styles.search, { backgroundColor: theme.colors.card }]}
      />

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

  header: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  search: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
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
});