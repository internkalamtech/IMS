import { ApiClient } from "@/core/api-client";
import { useTheme } from "@/core/theme/ThemeContext";
import StudentRegistrationForm, {
  StudentRegistrationData,
} from "@/presentation/components/StudentRegistrationForm";
import { ThemedText } from "@/presentation/components/ThemedText";
import { ThemedView } from "@/presentation/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface ClassData {
  id: number;
  name: string;
}

export default function AddUserScreen() {
  const { theme, isDark } = useTheme();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const api = ApiClient.getInstance().getAxios();
      const response = await api.get("/classes");
      console.log("Classes response:", response.data);
      console.log("Classes count:", response.data?.length);
      setClasses(response.data || []);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      // Set default/mock classes for now
      setClasses([
        { id: 1, name: "Class 1A" },
        { id: 2, name: "Class 1B" },
        { id: 3, name: "Class 2A" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    formData: StudentRegistrationData,
  ): Promise<boolean> => {
    try {
      setSubmitting(true);
      const api = ApiClient.getInstance().getAxios();

      // If role is Student, use the enrollment endpoint that links parent
      if (formData.role === "Student") {
        const payload = {
          student: {
            name: formData.name,
            roll_number: formData.rollNumber,
            class_id: parseInt(formData.classId),
            class_name: formData.className || "",
          },
          parent: {
            name: formData.parentName,
            phone: formData.parentPhone,
            email: formData.parentEmail,
            relationship_type: "Parent",
          },
          link_existing_parent: false,
        };

        const response = await api.post(
          "/enrollment/students/with-parent",
          payload,
        );

        if (response.status === 201) {
          setSuccessMessage(`✓ ${formData.name} registered successfully!`);
          setTimeout(() => router.back(), 1500);
          return true;
        }
      } else {
        // For other roles, use standard user creation endpoint
        const payload = {
          name: formData.name,
          email: formData.email,
          role: formData.role.toLowerCase(),
        };

        const response = await api.post("/users", payload);

        if (response.status === 201 || response.status === 200) {
          setSuccessMessage(`✓ ${formData.name} registered successfully!`);
          setTimeout(() => router.back(), 1500);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error submitting form:", error);
      Alert.alert(
        "Registration Failed",
        "Please check your information and try again",
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.primary}
      />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Premium Header */}
        <View
          style={[
            styles.headerGradient,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <ThemedText style={styles.headerTitle} type="defaultSemiBold">
                New Registration
              </ThemedText>
              <ThemedText style={styles.headerSubtitle} type="default">
                Add a new user to the system
              </ThemedText>
            </View>
            <View style={styles.headerIcon}>
              <Ionicons name="person-add" size={28} color="white" />
            </View>
          </View>
        </View>

        {/* Success Message */}
        {successMessage && (
          <View
            style={[
              styles.successMessage,
              { backgroundColor: theme.colors.primary + "20" },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={theme.colors.primary}
            />
            <ThemedText style={styles.successText}>{successMessage}</ThemedText>
          </View>
        )}

        {/* Form */}
        <StudentRegistrationForm
          classes={classes}
          onSubmit={handleSubmit}
          submitting={submitting}
          onCancel={handleCancel}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerGradient: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  successMessage: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 10,
  },
  successText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
