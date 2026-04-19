import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/core/api-client";

interface PaymentSummary {
  total_collectible: number;
  total_collected: number;
  total_pending: number;
  total_overdue: number;
}

interface FeeAnalyticsProps {
  theme?: any;
  isDark?: boolean;
}

export const FeeAnalyticsCard: React.FC<FeeAnalyticsProps> = ({
  theme,
  isDark = false,
}) => {
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadPaymentSummary();
  }, []);

  const loadPaymentSummary = async () => {
    try {
      setLoading(true);
      const response = await api.get("/payments/summary/stats");
      setSummary(response.data);
    } catch (error) {
      console.error("Failed to load payment summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString()}`;
  };

  const StatCard = ({
    label,
    value,
    icon,
    color,
  }: {
    label: string;
    value: number;
    icon: string;
    color: string;
  }) => (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: isDark ? "#2A2A2A" : "#F8F9FB",
          borderColor: isDark ? "#3A3A3A" : "#E5E7EB",
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text
          style={[
            styles.statLabel,
            { color: isDark ? "#A0A0A0" : "#666666" },
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            styles.statValue,
            { color: isDark ? "#FFFFFF" : "#1F2937" },
          ]}
        >
          {formatCurrency(value)}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#1F1F1F" : "#FFFFFF" },
        ]}
      >
        <ActivityIndicator size="small" color={theme?.colors?.primary || "#1E63D5"} />
      </View>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1F1F1F" : "#FFFFFF" },
      ]}
    >
      {/* Header */}
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Ionicons
            name="cash-outline"
            size={20}
            color={theme?.colors?.primary || "#1E63D5"}
          />
          <Text
            style={[
              styles.headerTitle,
              { color: isDark ? "#FFFFFF" : "#1F2937" },
            ]}
          >
            Fee Analytics
          </Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={isDark ? "#A0A0A0" : "#999999"}
        />
      </TouchableOpacity>

      {/* Collapsed View - Summary */}
      {!expanded && (
        <View
          style={[
            styles.summaryRow,
            { borderTopColor: isDark ? "#333333" : "#E5E7EB" },
          ]}
        >
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: isDark ? "#A0A0A0" : "#666" }]}>
              Collected
            </Text>
            <Text
              style={[styles.summaryValue, { color: "#10B981" }]}
            >
              {formatCurrency(summary.total_collected)}
            </Text>
          </View>
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? "#333333" : "#E5E7EB" },
            ]}
          />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: isDark ? "#A0A0A0" : "#666" }]}>
              Pending
            </Text>
            <Text
              style={[styles.summaryValue, { color: "#F59E0B" }]}
            >
              {formatCurrency(summary.total_pending)}
            </Text>
          </View>
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? "#333333" : "#E5E7EB" },
            ]}
          />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: isDark ? "#A0A0A0" : "#666" }]}>
              Overdue
            </Text>
            <Text
              style={[styles.summaryValue, { color: "#EF4444" }]}
            >
              {formatCurrency(summary.total_overdue)}
            </Text>
          </View>
        </View>
      )}

      {/* Expanded View - Detailed Stats */}
      {expanded && (
        <View
          style={[
            styles.expandedContent,
            { borderTopColor: isDark ? "#333333" : "#E5E7EB" },
          ]}
        >
          <StatCard
            label="Total Collectible"
            value={summary.total_collectible}
            icon="calculator"
            color="#1E63D5"
          />
          <StatCard
            label="Total Collected"
            value={summary.total_collected}
            icon="checkmark-circle"
            color="#10B981"
          />
          <StatCard
            label="Total Pending"
            value={summary.total_pending}
            icon="hourglass"
            color="#F59E0B"
          />
          <StatCard
            label="Total Overdue"
            value={summary.total_overdue}
            icon="alert-circle"
            color="#EF4444"
          />

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Text
              style={[
                styles.progressLabel,
                { color: isDark ? "#A0A0A0" : "#666" },
              ]}
            >
              Collection Rate
            </Text>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: isDark ? "#333333" : "#E5E7EB" },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      summary.total_collectible > 0
                        ? (summary.total_collected / summary.total_collectible) *
                          100
                        : 0
                    }%`,
                    backgroundColor: "#10B981",
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.progressPercent,
                { color: isDark ? "#FFFFFF" : "#1F2937" },
              ]}
            >
              {summary.total_collectible > 0
                ? `${Math.round(
                    (summary.total_collected / summary.total_collectible) * 100
                  )}% collected`
                : "No data"}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginHorizontal: 20,
    marginVertical: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  summaryRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  divider: {
    width: 1,
    marginVertical: 8,
  },
  expandedContent: {
    borderTopWidth: 1,
    padding: 16,
    gap: 12,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 3,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 11,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: "600",
  },
});
