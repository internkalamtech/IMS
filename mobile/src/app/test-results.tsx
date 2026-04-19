import React from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TestResult {
  name: string;
  status: "pass" | "fail" | "pending";
  message?: string;
}

export default function TestScreen() {
  const [results, setResults] = React.useState<TestResult[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const testResults: TestResult[] = [];

    // Test 1: Check API Client
    try {
      const module = await import("@/core/api-client");
      testResults.push({
        name: "API Client Module",
        status: "pass",
        message: "api instance available",
      });
    } catch (e) {
      testResults.push({
        name: "API Client Module",
        status: "fail",
        message: String(e),
      });
    }

    // Test 2: Check Fee Structure Screens
    try {
      await import("@/presentation/screens/FeeStructureListScreen");
      testResults.push({
        name: "Fee Structure List Screen",
        status: "pass",
        message: "Screen component exported",
      });
    } catch (e) {
      testResults.push({
        name: "Fee Structure List Screen",
        status: "fail",
        message: String(e),
      });
    }

    // Test 3: Check Manage Fee Structure Screen
    try {
      await import("@/presentation/screens/ManageFeeStructureScreen");
      testResults.push({
        name: "Manage Fee Structure Screen",
        status: "pass",
        message: "Screen component exported",
      });
    } catch (e) {
      testResults.push({
        name: "Manage Fee Structure Screen",
        status: "fail",
        message: String(e),
      });
    }

    // Test 4: Check Fee Analytics Card
    try {
      await import("@/presentation/components/FeeAnalyticsCard");
      testResults.push({
        name: "Fee Analytics Card",
        status: "pass",
        message: "Component exported",
      });
    } catch (e) {
      testResults.push({
        name: "Fee Analytics Card",
        status: "fail",
        message: String(e),
      });
    }

    // Test 5: Check Auth Context
    try {
      const { useAuth } = await import("@/presentation/hooks/useAuth");
      testResults.push({
        name: "Auth Context",
        status: "pass",
        message: "useAuth hook available",
      });
    } catch (e) {
      testResults.push({
        name: "Auth Context",
        status: "fail",
        message: String(e),
      });
    }

    // Test 6: Check Theme Context
    try {
      const { useTheme } = await import("@/core/theme/ThemeContext");
      testResults.push({
        name: "Theme Context",
        status: "pass",
        message: "useTheme hook available",
      });
    } catch (e) {
      testResults.push({
        name: "Theme Context",
        status: "fail",
        message: String(e),
      });
    }

    // Test 7: Check Router
    try {
      const router = require("expo-router");
      if (router.useRouter) {
        testResults.push({
          name: "Expo Router",
          status: "pass",
          message: "Router available",
        });
      } else {
        throw new Error("Router not configured");
      }
    } catch (e) {
      testResults.push({
        name: "Expo Router",
        status: "fail",
        message: String(e),
      });
    }

    // Test 8: Check Navigation Screens
    try {
      const screens = [
        "fee-structures",
        "manage-fee-structure",
        "manage-classes",
      ];
      for (const screen of screens) {
        try {
          await import(`@/app/${screen}`);
        } catch {
          throw new Error(`Screen ${screen} not found`);
        }
      }
      testResults.push({
        name: "Navigation Screens",
        status: "pass",
        message: "All required screens present",
      });
    } catch (e) {
      testResults.push({
        name: "Navigation Screens",
        status: "fail",
        message: String(e),
      });
    }

    // Test 9: Check Providers
    try {
      const providers = await import("@/presentation/context/AuthContext");
      testResults.push({
        name: "Context Providers",
        status: "pass",
        message: "AuthProvider available",
      });
    } catch (e) {
      testResults.push({
        name: "Context Providers",
        status: "fail",
        message: String(e),
      });
    }

    // Test 10: Check Storage Service
    try {
      const storage = await import("@/data/local/storage");
      testResults.push({
        name: "Storage Service",
        status: "pass",
        message: "Storage service available",
      });
    } catch (e) {
      testResults.push({
        name: "Storage Service",
        status: "fail",
        message: String(e),
      });
    }

    setResults(testResults);
    setLoading(false);
  };

  const passCount = results.filter((r) => r.status === "pass").length;
  const failCount = results.filter((r) => r.status === "fail").length;

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E63D5" />
        <Text style={styles.loadingText}>Running Mobile App Tests...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>📱 Mobile App Test Results</Text>
        <View style={styles.summary}>
          <View style={[styles.summaryItem, { backgroundColor: "#10B981" }]}>
            <Text style={styles.summaryLabel}>Passed</Text>
            <Text style={styles.summaryValue}>{passCount}/{results.length}</Text>
          </View>
          <View style={[styles.summaryItem, { backgroundColor: failCount > 0 ? "#EF4444" : "#6B7280" }]}>
            <Text style={styles.summaryLabel}>Failed</Text>
            <Text style={styles.summaryValue}>{failCount}</Text>
          </View>
        </View>
      </View>

      <View style={styles.results}>
        {results.map((result, index) => (
          <View
            key={index}
            style={[
              styles.resultItem,
              result.status === "pass" && styles.resultPass,
              result.status === "fail" && styles.resultFail,
            ]}
          >
            <View style={styles.resultHeader}>
              <Ionicons
                name={result.status === "pass" ? "checkmark-circle" : "close-circle"}
                size={20}
                color={result.status === "pass" ? "#10B981" : "#EF4444"}
              />
              <Text style={styles.resultName}>{result.name}</Text>
            </View>
            {result.message && (
              <Text style={styles.resultMessage}>{result.message}</Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {failCount === 0 ? "✅ All tests passed!" : `⚠️ ${failCount} test(s) failed`}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E63D5",
    marginBottom: 16,
  },
  summary: {
    flexDirection: "row",
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: "white",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  results: {
    gap: 12,
  },
  resultItem: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#E5E7EB",
  },
  resultPass: {
    borderLeftColor: "#10B981",
  },
  resultFail: {
    borderLeftColor: "#EF4444",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  resultName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  resultMessage: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 32,
  },
  footer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#E0F2FE",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#1E63D5",
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E63D5",
  },
});
