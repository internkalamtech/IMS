import React, { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import SubjectSelector from "@/presentation/components/SubjectSelector";
import { useClassSubjects } from "@/presentation/hooks/useClassSubjects";

export default function ManageClassesScreen() {
  const {
    availableSubjects,
    selectedSubjects,
    setSelectedSubjects,
    saveSubjects,
  } = useClassSubjects(1);

  const [clearTrigger, setClearTrigger] = useState(0);

  const handleSave = async () => {
    await saveSubjects();
    setClearTrigger((prev) => prev + 1);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F5F7FB" }}
      contentContainerStyle={{ paddingBottom: 30 }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View
        style={{
          backgroundColor: "#1E63D5",
          paddingTop: 50,
          paddingBottom: 20,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* BACK BUTTON */}
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <Text
            style={{
              color: "white",
              fontSize: 20,
              fontWeight: "bold",
              marginLeft: 10,
            }}
          >
            Manage Classes
          </Text>
        </View>

        <Text style={{ color: "#E0E0E0", marginTop: 5 }}>
          Create and manage classes
        </Text>
      </View>

      {/* CONTENT */}
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 10 }}>
          Subjects
        </Text>

        <SubjectSelector
          availableSubjects={availableSubjects}
          selectedSubjects={selectedSubjects}
          onChange={setSelectedSubjects}
          clearTrigger={clearTrigger}
        />

        {/* SAVE BUTTON */}
        <TouchableOpacity
          onPress={handleSave}
          style={{
            backgroundColor: "#1E63D5",
            padding: 14,
            borderRadius: 10,
            marginTop: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
            Save Subjects
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
