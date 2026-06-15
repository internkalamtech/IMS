import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";

type LeaveRequest = {
  id: string;
  studentName: string;
  rollNumber: string;
  className: string;
  status: "pending" | "approved" | "rejected";
  date: string;
};

const MOCK_LEAVES: LeaveRequest[] = [
  {
    id: "1",
    studentName: "Emma Wilson",
    rollNumber: "001",
    className: "7A",
    status: "pending",
    date: "2025-06-15",
  },
  {
    id: "2",
    studentName: "Liam Johnson",
    rollNumber: "002",
    className: "7B",
    status: "approved",
    date: "2025-06-14",
  },
  {
    id: "3",
    studentName: "Olivia Brown",
    rollNumber: "003",
    className: "7A",
    status: "rejected",
    date: "2025-06-13",
  },
];

export default function TeacherLeaveDashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");

  const pendingCount = MOCK_LEAVES.filter(
    item => item.status === "pending"
  ).length;

  const approvedCount = MOCK_LEAVES.filter(
    item => item.status === "approved"
  ).length;

  const rejectedCount = MOCK_LEAVES.filter(
    item => item.status === "rejected"
  ).length;

  const filteredLeaves = MOCK_LEAVES.filter(item => {
    const classMatch =
  selectedClass === "all" ||
  item.className === selectedClass;
    const statusMatch =
      statusFilter === "all" ||
      item.status === statusFilter;

    const searchMatch =
      item.studentName
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      item.rollNumber.includes(search) ||
      item.className
        .toLowerCase()
        .includes(search.toLowerCase());

    return (
  classMatch &&
  statusMatch &&
  searchMatch
);
  });
  const sortedLeaves = [...filteredLeaves].sort((a, b) => {

  if (
    a.status === "pending" &&
    b.status !== "pending"
  ) return -1;

  if (
    a.status !== "pending" &&
    b.status === "pending"
  ) return 1;

  return (
    new Date(b.date).getTime() -
    new Date(a.date).getTime()
  );
});

  return (
    <View style={styles.container}>

      <Text style={styles.header}>
        Leave Management
      </Text>

      <TextInput
        placeholder="Search student, roll no, class"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />
<View style={styles.filterRow}>

  <TouchableOpacity
    onPress={() => setSelectedClass("all")}
  > 
    <Text>All Classes</Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => setSelectedClass("7A")}
  >
    <Text>7A</Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => setSelectedClass("7B")}
  >
    <Text>7B</Text>
  </TouchableOpacity>

</View>


      <View style={styles.summaryRow}>
        <View style={styles.card}>
          <Text>Pending</Text>
          <Text>{pendingCount}</Text>
        </View>

        <View style={styles.card}>
          <Text>Approved</Text>
          <Text>{approvedCount}</Text>
        </View>

        <View style={styles.card}>
          <Text>Rejected</Text>
          <Text>{rejectedCount}</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          onPress={() => setStatusFilter("all")}
        >
          <Text>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setStatusFilter("pending")}
        >
          <Text>Pending</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setStatusFilter("approved")}
        >
          <Text>Approved</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setStatusFilter("rejected")}
        >
          <Text>Rejected</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedLeaves}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.leaveCard}>
            <Text>{item.studentName}</Text>
            <Text>{item.rollNumber}</Text>
            <Text>{item.className}</Text>
            <Text>{item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f5f5f5",
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  search: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    width: "30%",
    alignItems: "center",
  },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },

  leaveCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
});