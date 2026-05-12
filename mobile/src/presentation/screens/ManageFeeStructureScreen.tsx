import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { api } from "@/core/api-client";

type FeeBreakdownForm = {
  fee_head: string;
  amount: string;
  description: string;
};

type InstallmentForm = {
  installment_number: number;
  due_date: string;
  amount: string;
  description?: string;
};

type FeeStructureFormState = {
  className: string;
  academicYear: string;
  totalAmount: string;
  breakdowns: FeeBreakdownForm[];
  installments: InstallmentForm[];
};

export default function ManageFeeStructureScreen() {
  const params = useLocalSearchParams();
  const isEdit = params.edit === "1";
  const structureId = params.id ? parseInt(params.id as string) : null;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedInstallmentIndex, setSelectedInstallmentIndex] = useState(0);

  const [formData, setFormData] = useState<FeeStructureFormState>({
    className: "",
    academicYear: "",
    totalAmount: "",
    breakdowns: [{ fee_head: "", amount: "", description: "" }],
    installments: [
      { installment_number: 1, due_date: new Date().toISOString(), amount: "" },
    ],
  });

  useEffect(() => {
    if (isEdit && structureId) {
      loadFeeStructure();
    }
  }, []);

  const loadFeeStructure = async () => {
    try {
      const response = await api.get(`/fee-structures/${structureId}`);
      const data = response.data;
      setFormData({
        className: data.class_name,
        academicYear: data.academic_year,
        totalAmount: data.total_amount.toString(),
        breakdowns: data.breakdowns.map((bd: any) => ({
          fee_head: bd.fee_head,
          amount: bd.amount.toString(),
          description: bd.description || "",
        })),
        installments: data.installments.map((i: any) => ({
          installment_number: i.installment_number,
          due_date: i.due_date,
          amount: i.amount.toString(),
        })),
      });
    } catch (error) {
      Alert.alert("Error", "Failed to load fee structure");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBreakdown = () => {
    setFormData({
      ...formData,
      breakdowns: [
        ...formData.breakdowns,
        { fee_head: "", amount: "", description: "" },
      ],
    });
  };

  const handleRemoveBreakdown = (index: number) => {
    if (formData.breakdowns.length > 1) {
      setFormData({
        ...formData,
        breakdowns: formData.breakdowns.filter((_, i) => i !== index),
      });
    }
  };

  const handleUpdateBreakdown = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...formData.breakdowns];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, breakdowns: updated });
  };

  const handleAddInstallment = () => {
    setFormData({
      ...formData,
      installments: [
        ...formData.installments,
        {
          installment_number: formData.installments.length + 1,
          due_date: new Date().toISOString(),
          amount: "",
        },
      ],
    });
  };

  const handleRemoveInstallment = (index: number) => {
    if (formData.installments.length > 1) {
      setFormData({
        ...formData,
        installments: formData.installments.filter((_, i) => i !== index),
      });
    }
  };

  const handleUpdateInstallment = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...formData.installments];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, installments: updated });
  };

  const parsePositiveAmount = (value: string) => {
    const amount = parseFloat(value);
    return Number.isFinite(amount) && amount > 0 ? amount : null;
  };

  const normalizeDueDate = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toISOString();
  };

  const closeDatePicker = () => {
    const currentValue =
      formData.installments[selectedInstallmentIndex]?.due_date || "";
    const normalized = normalizeDueDate(currentValue);
    if (!normalized) {
      Alert.alert("Error", "Please enter a valid due date (YYYY-MM-DD)");
      return;
    }
    const updated = [...formData.installments];
    updated[selectedInstallmentIndex].due_date = normalized;
    setFormData({ ...formData, installments: updated });
    setShowDatePicker(false);
  };

  const validateForm = () => {
    if (!formData.className.trim()) {
      Alert.alert("Error", "Please enter class name");
      return false;
    }
    if (!formData.academicYear.trim()) {
      Alert.alert("Error", "Please enter academic year");
      return false;
    }
    const totalAmount = parsePositiveAmount(formData.totalAmount);
    if (totalAmount === null) {
      Alert.alert("Error", "Please enter valid total amount");
      return false;
    }
    for (const bd of formData.breakdowns) {
      if (!bd.fee_head.trim()) {
        Alert.alert("Error", "Please fill all breakdown fields");
        return false;
      }
      if (parsePositiveAmount(bd.amount) === null) {
        Alert.alert(
          "Error",
          `Please enter a valid amount greater than 0 for ${bd.fee_head || "each breakdown"}`
        );
        return false;
      }
    }
    for (const installment of formData.installments) {
      if (parsePositiveAmount(installment.amount) === null) {
        Alert.alert(
          "Error",
          `Please enter a valid installment amount greater than 0 for installment ${installment.installment_number}`
        );
        return false;
      }
      if (!normalizeDueDate(installment.due_date)) {
        Alert.alert(
          "Error",
          `Please enter a valid due date for installment ${installment.installment_number}`
        );
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const totalAmount = parsePositiveAmount(formData.totalAmount);
      if (totalAmount === null) {
        Alert.alert("Error", "Please enter valid total amount");
        return;
      }

      const breakdowns = formData.breakdowns.map((bd) => {
        const amount = parsePositiveAmount(bd.amount);
        if (amount === null) {
          throw new Error(`Invalid amount for ${bd.fee_head}`);
        }
        return {
          fee_head: bd.fee_head,
          amount,
          description: bd.description || null,
        };
      });

      const installments = formData.installments.map((i) => {
        const amount = parsePositiveAmount(i.amount);
        const dueDate = normalizeDueDate(i.due_date);
        if (amount === null || !dueDate) {
          throw new Error(`Invalid installment for ${i.installment_number}`);
        }
        return {
          installment_number: i.installment_number,
          due_date: dueDate,
          amount,
        };
      });

      const payload = {
        class_name: formData.className,
        academic_year: formData.academicYear,
        total_amount: totalAmount,
        breakdowns,
        installments,
      };

      if (isEdit && structureId) {
        await api.put(`/fee-structures/${structureId}`, payload);
        Alert.alert("Success", "Fee structure updated successfully");
      } else {
        await api.post("/fee-structures", payload);
        Alert.alert("Success", "Fee structure created successfully");
      }

      router.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.detail || "Failed to save fee structure"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F5F7FB",
        }}
      >
        <ActivityIndicator size="large" color="#1E63D5" />
      </View>
    );
  }

  const selectedDueDate =
    formData.installments[selectedInstallmentIndex]?.due_date || "";
  const displayDueDate = selectedDueDate
    ? selectedDueDate.split("T")[0]
    : "";

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
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text
            style={{
              color: "white",
              fontSize: 20,
              fontWeight: "bold",
              marginLeft: 15,
            }}
          >
            {isEdit ? "Edit Fee Structure" : "Create Fee Structure"}
          </Text>
        </View>
      </View>

      {/* FORM */}
      <View style={{ paddingHorizontal: 15, paddingTop: 20 }}>
        {/* BASIC INFO */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 15,
            marginBottom: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "bold",
              color: "#1E63D5",
              marginBottom: 15,
            }}
          >
            Basic Information
          </Text>

          <Text style={{ fontSize: 12, color: "#666", marginBottom: 5 }}>
            Class Name
          </Text>
          <TextInput
            placeholder="e.g., Grade 10"
            value={formData.className}
            onChangeText={(text) =>
              setFormData({ ...formData, className: text })
            }
            style={{
              borderWidth: 1,
              borderColor: "#E0E0E0",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 15,
              fontSize: 12,
            }}
          />

          <Text style={{ fontSize: 12, color: "#666", marginBottom: 5 }}>
            Academic Year
          </Text>
          <TextInput
            placeholder="e.g., 2024-25"
            value={formData.academicYear}
            onChangeText={(text) =>
              setFormData({ ...formData, academicYear: text })
            }
            style={{
              borderWidth: 1,
              borderColor: "#E0E0E0",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 15,
              fontSize: 12,
            }}
          />

          <Text style={{ fontSize: 12, color: "#666", marginBottom: 5 }}>
            Total Amount
          </Text>
          <TextInput
            placeholder="0.00"
            value={formData.totalAmount}
            onChangeText={(text) =>
              setFormData({ ...formData, totalAmount: text })
            }
            keyboardType="decimal-pad"
            style={{
              borderWidth: 1,
              borderColor: "#E0E0E0",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 12,
            }}
          />
        </View>

        {/* FEE BREAKDOWNS */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 15,
            marginBottom: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "bold",
                color: "#1E63D5",
              }}
            >
              Fee Breakdowns
            </Text>
            <TouchableOpacity
              onPress={handleAddBreakdown}
              style={{
                backgroundColor: "#1E63D5",
                padding: 6,
                borderRadius: 6,
              }}
            >
              <Ionicons name="add" size={16} color="white" />
            </TouchableOpacity>
          </View>

          {formData.breakdowns.map((breakdown, index) => (
            <View key={index} style={{ marginBottom: 15 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput
                  placeholder="Fee Head"
                  value={breakdown.fee_head}
                  onChangeText={(text) =>
                    handleUpdateBreakdown(index, "fee_head", text)
                  }
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: "#E0E0E0",
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    fontSize: 11,
                  }}
                />
                <TextInput
                  placeholder="Amount"
                  value={breakdown.amount}
                  onChangeText={(text) =>
                    handleUpdateBreakdown(index, "amount", text)
                  }
                  keyboardType="decimal-pad"
                  style={{
                    flex: 0.5,
                    borderWidth: 1,
                    borderColor: "#E0E0E0",
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    fontSize: 11,
                  }}
                />
                {formData.breakdowns.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveBreakdown(index)}
                    style={{
                      backgroundColor: "#EF4444",
                      padding: 8,
                      borderRadius: 6,
                    }}
                  >
                    <Ionicons name="trash" size={14} color="white" />
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                placeholder="Description (optional)"
                value={breakdown.description}
                onChangeText={(text) =>
                  handleUpdateBreakdown(index, "description", text)
                }
                style={{
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor: "#E0E0E0",
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  fontSize: 11,
                }}
              />
            </View>
          ))}
        </View>

        {/* INSTALLMENTS */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 15,
            marginBottom: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "bold",
                color: "#1E63D5",
              }}
            >
              Installments
            </Text>
            <TouchableOpacity
              onPress={handleAddInstallment}
              style={{
                backgroundColor: "#1E63D5",
                padding: 6,
                borderRadius: 6,
              }}
            >
              <Ionicons name="add" size={16} color="white" />
            </TouchableOpacity>
          </View>

          {formData.installments.map((installment, index) => (
            <View key={index} style={{ marginBottom: 15 }}>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
                <Text
                  style={{
                    flex: 1,
                    backgroundColor: "#F0F4F8",
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 8,
                    fontSize: 11,
                    color: "#666",
                    textAlignVertical: "center",
                  }}
                >
                  Installment {installment.installment_number}
                </Text>
                <TextInput
                  placeholder="Amount"
                  value={installment.amount}
                  onChangeText={(text) =>
                    handleUpdateInstallment(index, "amount", text)
                  }
                  keyboardType="decimal-pad"
                  style={{
                    flex: 0.5,
                    borderWidth: 1,
                    borderColor: "#E0E0E0",
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    fontSize: 11,
                  }}
                />
                {formData.installments.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveInstallment(index)}
                    style={{
                      backgroundColor: "#EF4444",
                      padding: 8,
                      borderRadius: 6,
                    }}
                  >
                    <Ionicons name="trash" size={14} color="white" />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                onPress={() => {
                  setSelectedInstallmentIndex(index);
                  setShowDatePicker(true);
                }}
                style={{
                  borderWidth: 1,
                  borderColor: "#E0E0E0",
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  backgroundColor: "#F9F9F9",
                }}
              >
                <Text style={{ fontSize: 11, color: "#666" }}>
                  Due Date:{" "}
                  {new Date(installment.due_date).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* DATE PICKER */}
      {showDatePicker && (
        <View
          style={{
            paddingHorizontal: 15,
            paddingVertical: 10,
            backgroundColor: "#f0f0f0",
          }}
        >
          <Text style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
            Select due date (YYYY-MM-DD format)
          </Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            value={displayDueDate}
            onChangeText={(text) => {
              const installments = [...formData.installments];
              if (selectedInstallmentIndex !== null) {
                installments[selectedInstallmentIndex].due_date = text;
                setFormData({ ...formData, installments });
              }
            }}
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          />
          <TouchableOpacity
            onPress={closeDatePicker}
            style={{
              marginTop: 10,
              alignSelf: "flex-end",
              backgroundColor: "#1E63D5",
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SUBMIT BUTTON */}
      <View style={{ paddingHorizontal: 15, paddingTop: 10 }}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          style={{
            backgroundColor: submitting ? "#CCC" : "#1E63D5",
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color="white" />
              <Text
                style={{
                  color: "white",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                {isEdit ? "Update" : "Create"} Fee Structure
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
