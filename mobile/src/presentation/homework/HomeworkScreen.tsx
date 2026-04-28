import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import HomeworkCard from "@/presentation/components/homework/HomeworkCard";
import {
  getHomeworks,
  createHomework,
  updateHomework,
  deleteHomework,
} from "../../data/homework/homeworkService";

import { useAuth } from "@/presentation/hooks/useAuth";

const HomeworkScreen = () => {
  const { user } = useAuth();

  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [assignType, setAssignType] = useState("ALL");
  const [students, setStudents] = useState("");

  const [editingHomework, setEditingHomework] = useState<any>(null);

  useEffect(() => {
    loadHomeworks();
  }, []);

  // ✅ LOAD DATA
  const loadHomeworks = async () => {
    try {
      const data = await getHomeworks();
      console.log("API DATA:", data);
      setHomeworks(data || []);
    } catch (error) {
      console.log("ERROR:", error);
    }
  };

// ✅ DELETE FINAL WORKING (WEB SAFE)

const handleDeleteHomework = async (id: string) => {

  console.log("DELETE BUTTON CLICKED:", id);

  // ✅ Use window.confirm instead of Alert
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this homework?"
  );

  if (!confirmDelete) return;

  try {

    console.log("CALLING DELETE API:", id);

    await deleteHomework(id);

    console.log("DELETE SUCCESS FROM FRONTEND");

    // remove from UI
    setHomeworks((prev) =>
      prev.filter((item) => item.id !== id)
    );

  } catch (error) {

    console.log("DELETE FAILED:", error);

    Alert.alert(
      "Error",
      "Delete failed"
    );

  }
};
  // ✅ EDIT
  const handleEditHomework = (item: any) => {
    setEditingHomework(item);
    setTitle(item.title);
    setDescription(item.description);
    setDueDate(item.dueDate);
    setSubject(item.subject);
    setClassName(item.className);
    setAssignType(item.assignType || "ALL");
    setStudents(item.students || "");
    setModalVisible(true);
  };

  // ✅ RESET
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setSubject("");
    setClassName("");
    setAssignType("ALL");
    setStudents("");
    setEditingHomework(null);
    setModalVisible(false);
  };

  // ✅ SAVE
  const handleSave = async () => {

    if (!title || !description || !dueDate || !subject || !className) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const payload = {
      title,
      description,
      subject,
      className,
      dueDate,
      assignType,
      students:
        assignType === "SELECTED"
          ? students.split(",").map((s) => s.trim())
          : [],
      teacherId: user?.id,
    };

    try {

      if (editingHomework) {
        await updateHomework(editingHomework.id, payload);
      } else {
        await createHomework(payload);
      }

      resetForm();
      loadHomeworks();

    } catch (error) {

      console.log("Save failed", error);
      Alert.alert("Error", "Something went wrong");

    }
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>

      {/* 📋 LIST */}
      <FlatList
        data={homeworks}

        // ✅ FIXED
        keyExtractor={(item) => item.id?.toString()}

        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 50 }}>
            No Homework Found
          </Text>
        }

        renderItem={({ item }) => {

          // ✅ IMPORTANT DEBUG
          console.log("ITEM DATA:", item);

          return (
            <HomeworkCard
              title={item.title}
              description={item.description}
              subject={item.subject}
              className={item.className}
              dueDate={item.dueDate}
              assignType={item.assignType}
              students={item.students}
              onEdit={() => handleEditHomework(item)}
              onDelete={() => handleDeleteHomework(item.id)}
            />
          );
        }}
      />

      {/* ➕ BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* 🪟 MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>

            <Text style={styles.title}>
              {editingHomework ? "Edit Homework" : "Add Homework"}
            </Text>

            <TextInput
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />

            <TextInput
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
            />

            <TextInput
              placeholder="Subject"
              value={subject}
              onChangeText={setSubject}
              style={styles.input}
            />

            <TextInput
              placeholder="Class Name"
              value={className}
              onChangeText={setClassName}
              style={styles.input}
            />

            <TextInput
              placeholder="Due Date (YYYY-MM-DD)"
              value={dueDate}
              onChangeText={setDueDate}
              style={styles.input}
            />

            {/* ASSIGN TYPE */}
            <Text style={{ fontWeight: "bold", marginTop: 10 }}>
              Assign Type
            </Text>

            <View style={{ flexDirection: "row", marginVertical: 10 }}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  assignType === "ALL" && styles.activeType,
                ]}
                onPress={() => {
                  setAssignType("ALL");
                  setStudents("");
                }}
              >
                <Text style={{ color: "#fff" }}>ALL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  assignType === "SELECTED" && styles.activeType,
                ]}
                onPress={() => setAssignType("SELECTED")}
              >
                <Text style={{ color: "#fff" }}>Selected</Text>
              </TouchableOpacity>
            </View>

            {/* STUDENTS */}
            {assignType === "SELECTED" && (
              <TextInput
                placeholder="Enter student names (comma separated)"
                value={students}
                onChangeText={setStudents}
                style={styles.input}
              />
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={{ color: "#fff" }}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={resetForm}>
              <Text style={{ textAlign: "center", marginTop: 10 }}>
                Cancel
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HomeworkScreen;

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007bff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalContent: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },

  input: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },

  saveBtn: {
    backgroundColor: "#007bff",
    padding: 12,
    alignItems: "center",
    borderRadius: 5,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  typeBtn: {
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
    backgroundColor: "#ccc",
  },

  activeType: {
    backgroundColor: "#007bff",
  },
});