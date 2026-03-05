import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";

type DocItem = {
  title: string;
  expiryDate: string; // YYYY-MM-DD
};

function parseDateOnly(dateStr: string) {
  // Ensures stable date parsing across devices/timezones
  // Expected format: YYYY-MM-DD
  return new Date(`${dateStr}T00:00:00`);
}

function daysLeft(expiryDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = parseDateOnly(expiryDate);
  const diffMs = expiry.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function getStatusLabel(left: number) {
  if (left < 0) return "Expired";
  if (left <= 30) return "Expiring Soon";
  return "Valid";
}

export default function ComplianceScreen() {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = useMemo(
    () => "http://localhost:8000/api/v1/driver/documents",
    []
  );

  const loadDocs = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`Request failed (HTTP ${res.status})`);

      const data = (await res.json()) as DocItem[];
      setDocs(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const badgeStyleFor = (status: string) => {
    if (status === "Expired") return styles.badgeExpired;
    if (status === "Expiring Soon") return styles.badgeSoon;
    return styles.badgeValid;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Vehicle & License Compliance</Text>
      <Text style={styles.subHeading}>
        Track your document expiry status to ensure you are driving legally.
      </Text>

      {loading && <Text style={styles.infoText}>Loading documents...</Text>}

      {!loading && error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Pressable style={styles.retryButton} onPress={loadDocs}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && docs.length === 0 && (
        <Text style={styles.infoText}>No documents found.</Text>
      )}

      {!loading &&
        !error &&
        docs.map((doc) => {
          const left = daysLeft(doc.expiryDate);
          const status = getStatusLabel(left);

          return (
            <View key={doc.title} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.cardTitle}>{doc.title}</Text>

                <View style={[styles.badge, badgeStyleFor(status)]}>
                  <Text style={styles.badgeText}>{status}</Text>
                </View>
              </View>

              <Text style={styles.expiryText}>Expiry Date: {doc.expiryDate}</Text>

              <Text style={styles.countdown}>
                {left < 0
                  ? `Expired ${Math.abs(left)} day(s) ago`
                  : `Expires in ${left} day(s)`}
              </Text>
            </View>
          );
        })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 30,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  subHeading: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },

  infoText: {
    marginBottom: 12,
    fontSize: 14,
    opacity: 0.8,
  },

  errorBox: {
    backgroundColor: "#fff0f0",
    borderWidth: 1,
    borderColor: "#ffb3b3",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#b00020",
    fontWeight: "600",
    marginBottom: 10,
  },
  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#b00020",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryText: {
    color: "white",
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
  },
  expiryText: {
    marginTop: 8,
    fontSize: 13,
    opacity: 0.8,
  },
  countdown: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  badgeExpired: {
    backgroundColor: "#d9534f",
  },
  badgeSoon: {
    backgroundColor: "#f0ad4e",
  },
  badgeValid: {
    backgroundColor: "#5cb85c",
  },
});