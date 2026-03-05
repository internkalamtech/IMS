import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function MaintenanceScreen() {
  const tasks = [
    { title: "Oil Change", date: "2026-03-20", status: "Scheduled" },
    { title: "Tire Check", date: "2026-03-15", status: "In Progress" },
    { title: "Brake Inspection", date: "2026-02-28", status: "Completed" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Bus Maintenance Timeline</Text>

      {tasks.map((task, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.title}>{task.title}</Text>
          <Text>Date: {task.date}</Text>

          <View
            style={[
              styles.badge,
              task.status === "Scheduled"
                ? styles.scheduled
                : task.status === "In Progress"
                ? styles.progress
                : styles.completed,
            ]}
          >
            <Text style={styles.badgeText}>{task.status}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
  },

  badge: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },

  scheduled: {
    backgroundColor: "#3aa0ff",
  },

  progress: {
    backgroundColor: "#f0ad4e",
  },

  completed: {
    backgroundColor: "#5cb85c",
  },
});