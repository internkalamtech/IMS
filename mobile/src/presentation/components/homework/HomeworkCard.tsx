import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDate } from "@/core/utils/dateFormatter";

interface HomeworkCardProps {
  id?: number;
  title: string;
  description?: string;
  subject: string;
  className?: string;
  dueDate?: string | Date;
  status?: "pending" | "submitted" | "overdue" | "completed";
  assignType?: string;
  students?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  isStudentView?: boolean;
}

const HomeworkCard = ({
  id,
  title,
  description,
  subject,
  className,
  dueDate,
  status = "pending",
  assignType,
  students,
  onEdit,
  onDelete,
  isStudentView = false,
}: HomeworkCardProps) => {
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FFA500"; // Orange
      case "submitted":
        return "#4CAF50"; // Green
      case "completed":
        return "#2196F3"; // Blue
      case "overdue":
        return "#F44336"; // Red
      default:
        return "#808080"; // Gray
    }
  };

  // Format due date
  const formattedDate = dueDate
    ? typeof dueDate === "string"
      ? new Date(dueDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : dueDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
    : "No due date";

  return (
    <View style={styles.card}>
      {/* Header with Title and Status */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.subject}>{subject}</Text>
        </View>
        {!isStudentView && (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(status) },
            ]}
          >
            <Text style={styles.statusText}>{status}</Text>
          </View>
        )}
      </View>

      {/* Description */}
      {description && (
        <View style={styles.section}>
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.description} numberOfLines={3}>{description}</Text>
        </View>
      )}

      {/* Due Date and Status */}
      <View style={styles.dueSection}>
        <View style={styles.dueItem}>
          <Ionicons name="calendar-outline" size={18} color="#666" />
          <Text style={styles.dueText}>Due: {formattedDate}</Text>
        </View>
        {isStudentView && (
          <View
            style={[
              styles.studentStatusBadge,
              { backgroundColor: getStatusColor(status) },
            ]}
          >
            <Text style={styles.studentStatusText}>{status}</Text>
          </View>
        )}
      </View>

      {/* Additional Info (for admin view) */}
      {!isStudentView && className && (
        <View style={styles.section}>
          <Text style={styles.label}>Class:</Text>
          <Text style={styles.value}>{className}</Text>
        </View>
      )}

      {!isStudentView && assignType && (
        <View style={styles.section}>
          <Text style={styles.label}>Assign Type:</Text>
          <Text style={styles.value}>
            {assignType === "ALL" ? "All Students" : "Selected Students"}
          </Text>
        </View>
      )}

      {!isStudentView && assignType === "SELECTED" && students && (
        <View style={styles.section}>
          <Text style={styles.label}>Assigned To:</Text>
          <Text style={styles.value}>{students}</Text>
        </View>
      )}

      {/* ACTION BUTTONS (only for admin) */}
      {!isStudentView && (onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Ionicons name="create-outline" size={20} color="#2196F3" />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={20} color="#F44336" />
              <Text style={[styles.actionText, { color: "#F44336" }]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default HomeworkCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subject: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: "center",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  section: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  description: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  value: {
    fontSize: 14,
    color: "#333",
  },
  dueSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: 12,
  },
  dueItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dueText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  studentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  studentStatusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#F5F5F5",
    flex: 1,
    justifyContent: "center",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2196F3",
  },
});