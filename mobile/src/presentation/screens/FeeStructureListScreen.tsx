import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { api } from "@/core/api-client";

interface FeeStructure {
  id: number;
  class_name: string;
  academic_year: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  breakdowns: Array<{
    id: number;
    fee_head: string;
    amount: number;
    description?: string;
  }>;
  installments: Array<{
    id: number;
    installment_number: number;
    due_date: string;
    amount: number;
  }>;
}

export default function FeeStructureListScreen() {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState({ className: "", academicYear: "" });

  useEffect(() => {
    loadFeeStructures();
  }, [filter]);

  const loadFeeStructures = async () => {
    try {
      setLoading(true);
      const response = await api.get("/fee-structures", {
        params: {
          ...(filter.className && { class_name: filter.className }),
          ...(filter.academicYear && { academic_year: filter.academicYear }),
        },
      });
      setFeeStructures(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load fee structures");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeeStructures();
    setRefreshing(false);
  }, [filter]);

  const handleDelete = async (id: number, className: string) => {
    Alert.alert(
      "Delete Fee Structure",
      `Are you sure you want to delete the fee structure for ${className}?`,
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await api.delete(`/fee-structures/${id}`);
              setFeeStructures(
                feeStructures.filter((item) => item.id !== id)
              );
              Alert.alert("Success", "Fee structure deleted");
            } catch (error) {
              Alert.alert("Error", "Failed to delete fee structure");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const renderFeeStructureItem = ({ item }: { item: FeeStructure }) => (
    <View
      style={{
        backgroundColor: "white",
        marginHorizontal: 15,
        marginVertical: 10,
        borderRadius: 12,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "#1E63D5",
              marginBottom: 5,
            }}
          >
            {item.class_name}
          </Text>
          <Text style={{ fontSize: 12, color: "#666", marginBottom: 3 }}>
            Academic Year: {item.academic_year}
          </Text>
          <Text style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
            Total Amount: ₹{item.total_amount.toLocaleString()}
          </Text>
          <Text style={{ fontSize: 11, color: "#999" }}>
            {item.breakdowns?.length || 0} fee heads •{" "}
            {item.installments?.length || 0} installments
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() =>
              router.push(`/manage-fee-structure?id=${item.id}&edit=1`)
            }
            style={{
              backgroundColor: "#1E63D5",
              padding: 8,
              borderRadius: 8,
            }}
          >
            <Ionicons name="pencil" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id, item.class_name)}
            style={{
              backgroundColor: "#EF4444",
              padding: 8,
              borderRadius: 8,
            }}
          >
            <Ionicons name="trash" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F5F7FB" }}
      contentContainerStyle={{ paddingBottom: 30 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
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
              flex: 1,
            }}
          >
            Fee Structures
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/manage-fee-structure")}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              padding: 8,
              borderRadius: 8,
            }}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* FILTER SECTION */}
      <View
        style={{
          paddingHorizontal: 15,
          paddingVertical: 15,
          backgroundColor: "white",
          marginHorizontal: 15,
          marginTop: 15,
          borderRadius: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        <Text style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
          Filter by:
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput
            placeholder="Class name"
            value={filter.className}
            onChangeText={(text) =>
              setFilter((prev) => ({ ...prev, className: text }))
            }
            style={{
              flex: 1,
              backgroundColor: "#F0F4F8",
              padding: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: filter.className !== "" ? "#1E63D5" : "#E0E0E0",
              fontSize: 12,
              color: "#333",
            }}
          />
          <TextInput
            placeholder="Academic year"
            value={filter.academicYear}
            onChangeText={(text) =>
              setFilter((prev) => ({ ...prev, academicYear: text }))
            }
            style={{
              flex: 1,
              backgroundColor: "#F0F4F8",
              padding: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor:
                filter.academicYear !== "" ? "#1E63D5" : "#E0E0E0",
              fontSize: 12,
              color: "#333",
            }}
          />
        </View>
      </View>

      {/* CONTENT */}
      {feeStructures.length === 0 ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 40,
          }}
        >
          <Ionicons name="document-outline" size={48} color="#CCC" />
          <Text style={{ fontSize: 14, color: "#999", marginTop: 10 }}>
            No fee structures found
          </Text>
        </View>
      ) : (
        <FlatList
          scrollEnabled={false}
          data={feeStructures}
          renderItem={renderFeeStructureItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingTop: 10 }}
        />
      )}
    </ScrollView>
  );
}
