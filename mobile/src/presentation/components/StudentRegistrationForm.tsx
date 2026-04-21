import { useTheme } from "@/core/theme/ThemeContext";
import SubjectSelector, {
  Subject,
} from "@/presentation/components/SubjectSelector";
import { ThemedButton } from "@/presentation/components/ThemedButton";
import { ThemedCard } from "@/presentation/components/ThemedCard";
import { ThemedText } from "@/presentation/components/ThemedText";
import { ThemedTextInput } from "@/presentation/components/ThemedTextInput";
import { ThemedView } from "@/presentation/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface StudentRegistrationFormProps {
  classes: { id: string; name: string }[];
  availableSubjects: Subject[];
  onSubmit: (data: StudentRegistrationData) => Promise<boolean>;
  submitting: boolean;
  onCancel: () => void;
}

export interface StudentRegistrationData {
  name: string;
  email: string;
  role: string;
  phone: string;
  rollNumber: string;
  dateOfBirth: string;
  bloodGroup: string;
  classId: string;
  className?: string;
  subjects?: string[];
  license?: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
}

const ROLES = ["Student", "Teacher", "Parent", "Admin", "Driver", "Transport"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function StudentRegistrationForm({
  classes,
  availableSubjects,
  onSubmit,
  submitting,
  onCancel,
}: StudentRegistrationFormProps) {
  const { theme } = useTheme();

  const [formData, setFormData] = useState<StudentRegistrationData>({
    name: "",
    email: "",
    role: "Student",
    phone: "",
    rollNumber: "",
    dateOfBirth: "",
    bloodGroup: "A+",
    classId: classes[0]?.id || "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
  });

  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);

  const [errors, setErrors] = useState<Partial<StudentRegistrationData>>({});
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showBloodGroupDropdown, setShowBloodGroupDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);

  const isStudent = formData.role === "Student";
  const isTeacher = formData.role === "Teacher";
  const isDriver = formData.role === "Driver";

  const validateForm = (): boolean => {
    const newErrors: Partial<StudentRegistrationData> = {};

    // Common validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Phone required for staff and students
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\+?[0-9\s\-()]{7,}$/.test(formData.phone)) {
      newErrors.phone = "Valid phone number required";
    }

    // Student-specific validation
    if (isStudent) {
      if (!formData.rollNumber.trim()) {
        newErrors.rollNumber = "Roll number is required";
      }
      if (!formData.dateOfBirth.trim()) {
        newErrors.dateOfBirth = "Date of birth is required";
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.dateOfBirth)) {
        newErrors.dateOfBirth = "Format: YYYY-MM-DD";
      }
      if (!formData.classId) {
        newErrors.classId = "Class selection is required";
      }

      // Parent details validation
      if (!formData.parentName.trim()) {
        newErrors.parentName = "Parent name is required";
      }
      if (!formData.parentPhone.trim()) {
        newErrors.parentPhone = "Parent phone is required";
      } else if (!/^\d{10,}$/.test(formData.parentPhone.replace(/\D/g, ""))) {
        newErrors.parentPhone = "Valid phone number required";
      }
      if (!formData.parentEmail.trim()) {
        newErrors.parentEmail = "Parent email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) {
        newErrors.parentEmail = "Invalid email format";
      }
    }

    // Teacher-specific validation
    if (isTeacher) {
      if (selectedSubjects.length === 0) {
        newErrors.subjects = "At least one subject is required" as any;
      }
      if (!formData.classId) {
        newErrors.classId = "Class assignment is required";
      }
    }

    // Driver-specific validation
    if (isDriver) {
      if (!formData.license || !formData.license.trim()) {
        newErrors.license = "Driver license is required" as any;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please fill in all required fields correctly.",
      );
      return;
    }

    const success = await onSubmit(formData);

    if (success) {
      if (Platform.OS === "web") {
        alert("User registered successfully!");
        onCancel();
      } else {
        Alert.alert("Success", "User registered successfully!", [
          { text: "OK", onPress: onCancel },
        ]);
      }
    } else {
      if (Platform.OS === "web") {
        alert("Failed to register user. Please try again.");
      } else {
        Alert.alert("Error", "Failed to register user. Please try again.");
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title} type="title">
              Registration
            </ThemedText>
            <ThemedText style={styles.subtitle} type="default">
              Please fill in all the required information below
            </ThemedText>
          </View>

          {/* Common Fields Card */}
          <ThemedCard style={styles.card}>
            <View style={{ marginBottom: 8 }}>
              <Ionicons
                name="person-outline"
                size={22}
                color={theme.colors.primary}
                style={{ marginBottom: 12 }}
              />
              <ThemedText style={styles.sectionTitle} type="defaultSemiBold">
                Basic Information
              </ThemedText>
            </View>

            <ThemedTextInput
              label="Full Name"
              placeholder="Enter full name"
              value={formData.name}
              onChangeText={(value) =>
                setFormData({ ...formData, name: value })
              }
              error={errors.name}
              editable={!submitting}
            />

            <ThemedTextInput
              label="Email Address"
              placeholder="Enter email address"
              value={formData.email}
              onChangeText={(value) =>
                setFormData({ ...formData, email: value })
              }
              keyboardType="email-address"
              error={errors.email}
              editable={!submitting}
            />

            <ThemedTextInput
              label="Phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChangeText={(value) =>
                setFormData({ ...formData, phone: value })
              }
              keyboardType="phone-pad"
              error={errors.phone}
              editable={!submitting}
            />

            {/* Role Selection */}
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel} type="defaultSemiBold">
                Role
              </ThemedText>
              <TouchableOpacity
                style={[
                  styles.dropdown,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.input,
                  },
                ]}
                onPress={() => setShowRoleDropdown(!showRoleDropdown)}
                disabled={submitting}
              >
                <ThemedText>{formData.role}</ThemedText>
                <Ionicons
                  name={showRoleDropdown ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={theme.colors.foreground}
                />
              </TouchableOpacity>

              {showRoleDropdown && (
                <View
                  style={[
                    styles.dropdownMenu,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <ScrollView
                    nestedScrollEnabled={true}
                    scrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                  >
                    {ROLES.map((role) => (
                      <TouchableOpacity
                        key={role}
                        style={[
                          styles.dropdownItem,
                          {
                            backgroundColor:
                              formData.role === role
                                ? theme.colors.primary + "20"
                                : "transparent",
                          },
                        ]}
                        onPress={() => {
                          setFormData({ ...formData, role });
                          setShowRoleDropdown(false);
                        }}
                      >
                        <ThemedText>{role}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </ThemedCard>

          {/* Teacher / Driver specific fields */}
          {!isStudent && (
            <ThemedCard style={styles.card}>
              <View style={{ marginBottom: 8 }}>
                <Ionicons
                  name="briefcase-outline"
                  size={22}
                  color={theme.colors.primary}
                  style={{ marginBottom: 12 }}
                />
                <ThemedText style={styles.sectionTitle} type="defaultSemiBold">
                  Staff Details
                </ThemedText>
              </View>

              {/* Teacher fields */}
              {isTeacher && (
                <>
                  <ThemedText style={styles.fieldLabel} type="defaultSemiBold">
                    Subjects <ThemedText style={styles.required}>*</ThemedText>
                  </ThemedText>
                  <SubjectSelector
                    availableSubjects={availableSubjects}
                    selectedSubjects={selectedSubjects}
                    onChange={(subjects) => {
                      setSelectedSubjects(subjects);
                      setFormData({
                        ...formData,
                        subjects: subjects.map((s) => s.name),
                      });
                    }}
                    clearTrigger={0}
                  />

                  {errors.subjects && (
                    <ThemedText
                      style={{
                        color: theme.colors.destructive,
                        fontSize: 12,
                        marginTop: 6,
                      }}
                    >
                      {errors.subjects as any}
                    </ThemedText>
                  )}

                  {/* Class Assignment reuse */}
                  <View style={styles.fieldContainer}>
                    <ThemedText
                      style={styles.fieldLabel}
                      type="defaultSemiBold"
                    >
                      Class Assigned{" "}
                      <ThemedText style={styles.required}>*</ThemedText>
                    </ThemedText>
                    <TouchableOpacity
                      style={[
                        styles.dropdown,
                        {
                          borderColor: errors.classId
                            ? theme.colors.destructive
                            : theme.colors.border,
                          backgroundColor: theme.colors.input,
                        },
                      ]}
                      onPress={() => setShowClassDropdown(!showClassDropdown)}
                      disabled={submitting}
                    >
                      <ThemedText>
                        {classes.find(
                          (c) => c.id.toString() === formData.classId,
                        )?.name || "Select a class"}
                      </ThemedText>
                      <Ionicons
                        name={showClassDropdown ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={theme.colors.foreground}
                      />
                    </TouchableOpacity>

                    {showClassDropdown && (
                      <View
                        style={[
                          styles.dropdownMenu,
                          {
                            backgroundColor: theme.colors.card,
                            borderColor: theme.colors.border,
                          },
                        ]}
                      >
                        <ScrollView
                          nestedScrollEnabled={true}
                          scrollEnabled={true}
                          showsVerticalScrollIndicator={true}
                        >
                          {classes.map((classItem) => (
                            <TouchableOpacity
                              key={classItem.id}
                              style={[
                                styles.dropdownItem,
                                {
                                  backgroundColor:
                                    formData.classId === String(classItem.id)
                                      ? theme.colors.primary + "20"
                                      : "transparent",
                                },
                              ]}
                              onPress={() => {
                                setFormData({
                                  ...formData,
                                  classId: String(classItem.id),
                                  className: classItem.name,
                                });
                                setShowClassDropdown(false);
                              }}
                            >
                              <ThemedText>{classItem.name}</ThemedText>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                    {errors.classId && (
                      <ThemedText
                        style={{
                          color: theme.colors.destructive,
                          fontSize: 12,
                          marginTop: 4,
                        }}
                      >
                        {errors.classId}
                      </ThemedText>
                    )}
                  </View>
                </>
              )}

              {/* Driver fields */}
              {isDriver && (
                <ThemedTextInput
                  label="Driver License"
                  placeholder="Enter license number"
                  value={formData.license || ""}
                  onChangeText={(value) =>
                    setFormData({ ...formData, license: value })
                  }
                  error={errors.license}
                  editable={!submitting}
                />
              )}
            </ThemedCard>
          )}

          {/* Student-Specific Fields */}
          {isStudent && (
            <>
              {/* Academic Information Card */}
              <ThemedCard style={styles.card}>
                <View style={{ marginBottom: 8 }}>
                  <Ionicons
                    name="book-outline"
                    size={22}
                    color={theme.colors.primary}
                    style={{ marginBottom: 12 }}
                  />
                  <ThemedText
                    style={styles.sectionTitle}
                    type="defaultSemiBold"
                  >
                    Academic Information
                  </ThemedText>
                </View>

                <ThemedTextInput
                  label="Roll Number"
                  placeholder="Enter roll number"
                  value={formData.rollNumber}
                  onChangeText={(value) =>
                    setFormData({ ...formData, rollNumber: value })
                  }
                  error={errors.rollNumber}
                  editable={!submitting}
                />

                <ThemedTextInput
                  label="Date of Birth"
                  placeholder="YYYY-MM-DD"
                  value={formData.dateOfBirth}
                  onChangeText={(value) =>
                    setFormData({ ...formData, dateOfBirth: value })
                  }
                  error={errors.dateOfBirth}
                  editable={!submitting}
                />

                {/* Blood Group Selection */}
                <View style={styles.fieldContainer}>
                  <ThemedText style={styles.fieldLabel} type="defaultSemiBold">
                    Blood Group
                  </ThemedText>
                  <TouchableOpacity
                    style={[
                      styles.dropdown,
                      {
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.input,
                      },
                    ]}
                    onPress={() =>
                      setShowBloodGroupDropdown(!showBloodGroupDropdown)
                    }
                    disabled={submitting}
                  >
                    <ThemedText>{formData.bloodGroup}</ThemedText>
                    <Ionicons
                      name={
                        showBloodGroupDropdown ? "chevron-up" : "chevron-down"
                      }
                      size={20}
                      color={theme.colors.foreground}
                    />
                  </TouchableOpacity>

                  {showBloodGroupDropdown && (
                    <View
                      style={[
                        styles.dropdownMenu,
                        {
                          backgroundColor: theme.colors.card,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <ScrollView
                        nestedScrollEnabled={true}
                        scrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                      >
                        {BLOOD_GROUPS.map((bg) => (
                          <TouchableOpacity
                            key={bg}
                            style={[
                              styles.dropdownItem,
                              {
                                backgroundColor:
                                  formData.bloodGroup === bg
                                    ? theme.colors.primary + "20"
                                    : "transparent",
                              },
                            ]}
                            onPress={() => {
                              setFormData({ ...formData, bloodGroup: bg });
                              setShowBloodGroupDropdown(false);
                            }}
                          >
                            <ThemedText>{bg}</ThemedText>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Class Selection */}
                <View style={styles.fieldContainer}>
                  <ThemedText style={styles.fieldLabel} type="defaultSemiBold">
                    Class <ThemedText style={styles.required}>*</ThemedText>
                  </ThemedText>
                  <TouchableOpacity
                    style={[
                      styles.dropdown,
                      {
                        borderColor: errors.classId
                          ? theme.colors.destructive
                          : theme.colors.border,
                        backgroundColor: theme.colors.input,
                      },
                    ]}
                    onPress={() => setShowClassDropdown(!showClassDropdown)}
                    disabled={submitting}
                  >
                    <ThemedText>
                      {classes.find((c) => c.id.toString() === formData.classId)
                        ?.name || "Select a class"}
                    </ThemedText>
                    <Ionicons
                      name={showClassDropdown ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={theme.colors.foreground}
                    />
                  </TouchableOpacity>

                  {showClassDropdown && (
                    <View
                      style={[
                        styles.dropdownMenu,
                        {
                          backgroundColor: theme.colors.card,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <ScrollView
                        nestedScrollEnabled={true}
                        scrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                      >
                        {classes.map((classItem) => (
                          <TouchableOpacity
                            key={classItem.id}
                            style={[
                              styles.dropdownItem,
                              {
                                backgroundColor:
                                  formData.classId === String(classItem.id)
                                    ? theme.colors.primary + "20"
                                    : "transparent",
                              },
                            ]}
                            onPress={() => {
                              setFormData({
                                ...formData,
                                classId: String(classItem.id),
                                className: classItem.name,
                              });
                              setShowClassDropdown(false);
                            }}
                          >
                            <ThemedText>{classItem.name}</ThemedText>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                  {errors.classId && (
                    <ThemedText
                      style={{
                        color: theme.colors.destructive,
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      {errors.classId}
                    </ThemedText>
                  )}
                </View>
              </ThemedCard>

              {/* Parent Details Card */}
              <ThemedCard style={styles.card}>
                <View style={styles.sectionHeaderWithIcon}>
                  <Ionicons
                    name="people-outline"
                    size={22}
                    color={theme.colors.primary}
                  />
                  <ThemedText
                    style={styles.sectionTitle}
                    type="defaultSemiBold"
                  >
                    Parent Information
                  </ThemedText>
                </View>
                <ThemedText style={styles.sectionDescription} type="default">
                  Please provide your parent or guardian&apos;s contact
                  information
                </ThemedText>

                <ThemedTextInput
                  label="Parent Name"
                  placeholder="Enter parent name"
                  value={formData.parentName}
                  onChangeText={(value) =>
                    setFormData({ ...formData, parentName: value })
                  }
                  error={errors.parentName}
                  editable={!submitting}
                />

                <ThemedTextInput
                  label="Parent Phone"
                  placeholder="Enter phone number"
                  value={formData.parentPhone}
                  onChangeText={(value) =>
                    setFormData({ ...formData, parentPhone: value })
                  }
                  keyboardType="phone-pad"
                  error={errors.parentPhone}
                  editable={!submitting}
                />

                <ThemedTextInput
                  label="Parent Email"
                  placeholder="Enter parent email"
                  value={formData.parentEmail}
                  onChangeText={(value) =>
                    setFormData({ ...formData, parentEmail: value })
                  }
                  keyboardType="email-address"
                  error={errors.parentEmail}
                  editable={!submitting}
                />
              </ThemedCard>
            </>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <ThemedButton
              title="Cancel"
              onPress={onCancel}
              disabled={submitting}
              type="outline"
              style={styles.cancelButton}
            />
            <ThemedButton
              title={submitting ? "Registering..." : "Register User"}
              onPress={handleSubmit}
              disabled={submitting}
              type="primary"
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  title: {
    marginBottom: 8,
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    opacity: 0.7,
    fontSize: 14,
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 18,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  sectionHeaderWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  sectionDescription: {
    marginBottom: 16,
    opacity: 0.65,
    fontSize: 13,
    lineHeight: 18,
  },
  fieldContainer: {
    marginBottom: 18,
  },
  fieldLabel: {
    marginBottom: 10,
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  required: {
    color: "#ef4444",
    fontWeight: "600",
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderRadius: 10,
    minHeight: 50,
    gap: 8,
  },
  dropdownMenu: {
    borderWidth: 1.5,
    borderRadius: 10,
    marginTop: 6,
    maxHeight: 350,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
    minHeight: 48,
    justifyContent: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 10,
    minHeight: 52,
  },
  submitButton: {
    flex: 1,
    borderRadius: 10,
    minHeight: 52,
  },
});
