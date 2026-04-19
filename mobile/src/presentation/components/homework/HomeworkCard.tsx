import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HomeworkCard = ({
  title,
  description,
  subject,
  className,
  dueDate,
  assignType,
  students,
  onEdit,
  onDelete,
}: any) => {

  return (
    <View style={styles.card}>

      <Text style={styles.label}>Title:</Text>
      <Text style={styles.value}>{title}</Text>

      <Text style={styles.label}>Description:</Text>
      <Text style={styles.value}>{description}</Text>

      <Text style={styles.label}>Subject:</Text>
      <Text style={styles.value}>{subject}</Text>

      <Text style={styles.label}>Class Name:</Text>
      <Text style={styles.value}>{className}</Text>

      <Text style={styles.label}>Due Date:</Text>
      <Text style={styles.value}>{dueDate}</Text>

      <Text style={styles.label}>Assign Type:</Text>
      <Text style={styles.value}>
        {assignType === "ALL"
          ? "All Students"
          : "Selected Students"}
      </Text>

      {assignType === "SELECTED" && students && (
        <>
          <Text style={styles.label}>
            Assigned To:
          </Text>
          <Text style={styles.value}>
            {students}
          </Text>
        </>
      )}

      {/* ACTION BUTTONS */}
      <View style={styles.actions}>

        {/* EDIT */}
        <TouchableOpacity
          onPress={() => {
            console.log("EDIT ICON CLICKED");
            onEdit();
          }}
        >
          <Ionicons
            name="create-outline"
            size={22}
            color="blue"
          />
        </TouchableOpacity>

        {/* DELETE */}
        <TouchableOpacity
          onPress={() => {
            console.log("DELETE ICON CLICKED");
            onDelete();
          }}
        >
          <Ionicons
            name="trash-outline"
            size={22}
            color="red"
          />
        </TouchableOpacity>

      </View>

    </View>
  );
};

export default HomeworkCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },

  label: {
    fontWeight: "bold",
    marginTop: 5,
  },

  value: {
    marginBottom: 5,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
});