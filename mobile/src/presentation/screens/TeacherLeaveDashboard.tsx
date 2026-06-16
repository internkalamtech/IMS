import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";

  type LeaveRequest = {
  id: string;
  studentName: string;
  rollNumber: string;
  className: string;

  status: "pending" | "approved" | "rejected";

  date: string;

  startDate: string;
  endDate: string;
  totalDays: number;

  reason: string;
  appliedBy: string;

  reviewedBy?: string;
  reviewComment?: string;
  reviewedOn?: string;
};

const MOCK_LEAVES: LeaveRequest[] = [
  {
  id: "1",
  studentName: "Emma Wilson",
  rollNumber: "001",
  className: "7A",
  status: "pending",
  date: "2025-06-15",

  startDate: "2025-06-15",
  endDate: "2025-06-17",
  totalDays: 3,

  reason: "Medical Leave",

  appliedBy: "Parent",
},
  
  {
  id: "2",
  studentName: "Liam Johnson",
  rollNumber: "002",
  className: "7B",
  status: "approved",
  date: "2025-06-14",

  startDate: "2025-06-14",
  endDate: "2025-06-15",
  totalDays: 2,

  reason: "Family Function",

  appliedBy: "Student",

  reviewedBy: "Teacher User",
  reviewComment: "Approved",
  reviewedOn: "2025-06-14",
},

  {
  id: "3",
  studentName: "Olivia Brown",
  rollNumber: "003",
  className: "7A",
  status: "rejected",
  date: "2025-06-13",

  startDate: "2025-06-13",
  endDate: "2025-06-15",
  totalDays: 3,

  reason: "Personal Work",

  appliedBy: "Parent",

  reviewedBy: "Teacher User",
  reviewComment: "Insufficient details",
  reviewedOn: "2025-06-13",
}
];

export default function TeacherLeaveDashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [leaves, setLeaves] = useState(MOCK_LEAVES);
  const [showModal, setShowModal] = useState(false);

const [selectedLeave, setSelectedLeave] =
  useState<LeaveRequest | null>(null);

const [reviewComment, setReviewComment] =
  useState("");

const [actionType, setActionType] =
  useState<"approved" | "rejected">("approved");

  const pendingCount =leaves.filter(
    item => item.status === "pending"
  ).length;

  const approvedCount = leaves.filter(
    item => item.status === "approved"
  ).length;

  const rejectedCount = leaves.filter(
    item => item.status === "rejected"
  ).length;

  const filteredLeaves = leaves.filter(item => {
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

  <Text>Status: {item.status}</Text>

  <Text>
    Leave Period: {item.startDate} - {item.endDate}
  </Text>

  <Text>Total Days: {item.totalDays}</Text>

  <Text>Reason: {item.reason}</Text>

  <Text>Applied By: {item.appliedBy}</Text>

  {item.status === "pending" && (
    <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
      <TouchableOpacity
        style={{
          backgroundColor: "green",
          padding: 10,
          borderRadius: 8,
        }}
        onPress={() => {
  setSelectedLeave(item);
  setActionType("approved");
  setShowModal(true);
}}
      >
        <Text style={{ color: "white" }}>Approve</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: "red",
          padding: 10,
          borderRadius: 8,
        }}
        onPress={() => {
    setSelectedLeave(item);
    setActionType("rejected");
    setShowModal(true);
        }}
      >
        <Text style={{ color: "white" }}>Reject</Text>
      </TouchableOpacity>
    </View>
  )}

  {item.status !== "pending" && (
    <View style={{ marginTop: 10 }}>
      <Text>Reviewed By: {item.reviewedBy}</Text>
      <Text>Comment: {item.reviewComment}</Text>
      <Text>Reviewed On: {item.reviewedOn}</Text>
    </View>
  )}
</View>
        )}
      />

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              width: "80%",
              padding: 20,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              {actionType === "approved"
                ? "Approve Leave"
                : "Reject Leave"}
            </Text>

            <TextInput
              placeholder="Enter review comment"
              value={reviewComment}
              onChangeText={setReviewComment}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 10,
                marginBottom: 15,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setShowModal(false);
                  setReviewComment("");
                }}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
  onPress={() => {
    if (!selectedLeave || actionType === null) return;
    if (
  actionType === "rejected" &&
  reviewComment.trim() === ""
) {
  alert("Please enter a rejection reason");
  return;
}

    const updatedLeaves = leaves.map((leave) => {
      if (leave.id === selectedLeave.id) {
        return {
          ...leave,
          status: actionType,
          reviewedBy: "Teacher User",
          reviewComment: reviewComment,
          reviewedOn: new Date().toISOString().split("T")[0],
        };
      }

      return leave;
    });

    setLeaves(updatedLeaves);
    setShowModal(false);
    setReviewComment("");
    setSelectedLeave(null);
    setActionType("approved");
  }}
>
  <Text>Confirm</Text>
</TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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