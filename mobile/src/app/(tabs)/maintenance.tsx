import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

type MaintenanceTask = {
  title: string;
  date: string;
  status: "Scheduled" | "In Progress" | "Completed";
};

export default function MaintenanceScreen() {
  const tasks: MaintenanceTask[] = [
    { title: "Oil Change", date: "2026-03-20", status: "Scheduled" },
    { title: "Tire Check", date: "2026-03-15", status: "In Progress" },
    { title: "Brake Inspection", date: "2026-02-28", status: "Completed" },
  ];

  const badgeStyle = (status: MaintenanceTask["status"]) => {
    if (status === "Completed") return styles.completed;
    if (status === "In Progress") return styles.progress;
    return styles.scheduled;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Bus Maintenance Timeline</Text>

      {tasks.map((task, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.date}>Date: {task.date}</Text>

          <View style={[styles.badge, badgeStyle(task.status)]}>
            <Text style={styles.badgeText}>{task.status}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  heading: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  card: {
    backgroundColor: "#f2f2f2",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  title: { fontSize: 16, fontWeight: "600" },
  date: { marginTop: 6, opacity: 0.8 },
  badge: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  badgeText: { color: "white", fontWeight: "700" },
  scheduled: { backgroundColor: "#5bc0de" },
  progress: { backgroundColor: "#f0ad4e" },
  completed: { backgroundColor: "#5cb85c" },
});