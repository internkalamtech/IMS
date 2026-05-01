import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/core/theme/ThemeContext";
export default function StudentProfile() {
  const { theme } = useTheme();
  const router = useRouter();

  const { name, roll, class: studentClass, attendance, marks, rank, initialTab } =
    useLocalSearchParams();
  const tabLabels = ["Overview", "Exams", "Attendance", "Conduct", "Fees"];
  const normalizedInitialTab =
    typeof initialTab === "string" ? initialTab.toLowerCase() : undefined;
  const [activeTab, setActiveTab] = useState(0);
  const [examSectionY, setExamSectionY] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (!normalizedInitialTab) {
      setActiveTab(0);
      return;
    }

    const resolvedIndex = tabLabels.findIndex(
      (tab) => tab.toLowerCase() === normalizedInitialTab
    );
    setActiveTab(resolvedIndex >= 0 ? resolvedIndex : 0);
  }, [normalizedInitialTab]);

  useEffect(() => {
    if (normalizedInitialTab !== "exams" || examSectionY === null) {
      return;
    }

    scrollRef.current?.scrollTo({
      y: Math.max(0, examSectionY - 12),
      animated: true,
    });
  }, [normalizedInitialTab, examSectionY]);

  return (
  <ScrollView ref={scrollRef} style={{ flex: 1, backgroundColor: "#f5f7fb" }}>
    
    {/* BLUE HEADER */}
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Student Profile</Text>
      <Text style={styles.subtitle}>Complete student information</Text>

      {/* PROFILE CARD */}
      <View style={styles.profileCard}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.subText}>
          Class {studentClass} • Roll No: {roll}
        </Text>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.green}>{attendance}</Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.yellow}>{marks}</Text>
          <Text style={styles.statLabel}>Overall Score</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.white}>{rank}</Text>
          <Text style={styles.statLabel}>Class Rank</Text>
        </View>
      </View>
      <View style={styles.tabsContainer}>
        {tabLabels.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, index === activeTab && styles.activeTab]}
            onPress={() => setActiveTab(index)}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.tabText, index === activeTab && styles.activeTabText]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Parent/Guardian Contact</Text>

  <View style={styles.card}>
    
    {/* Parent Info */}
    <View style={styles.row}>
      <View style={styles.avatarCircle}>
        <Text style={{ color: "#fff" }}>👩</Text>
      </View>

      <View>
        <Text style={styles.parentName}>Mrs. Sarah Wilson</Text>
        <Text style={styles.subText}>Mother • Software Engineer</Text>
      </View>
    </View>

    {/* Primary Contact */}
    <View style={styles.contactRow}>
      <View>
        <Text style={styles.contactText}>+1 (555) 123-4567</Text>
        <Text style={styles.subText}>Primary Contact</Text>
      </View>

      <TouchableOpacity style={styles.callBtn}>
        <Text style={{ color: "#fff" }}>Call</Text>
      </TouchableOpacity>
    </View>

    {/* Secondary Contact */}
    <View style={styles.contactRow}>
      <View>
        <Text style={styles.contactText}>+1 (555) 987-6543</Text>
        <Text style={styles.subText}>Father</Text>
      </View>

      <TouchableOpacity style={styles.secondaryBtn}>
        <Text>Call</Text>
      </TouchableOpacity>
    </View>

    {/* Email */}
    <View style={styles.contactRow}>
      <View>
        <Text style={styles.contactText}>sarah.wilson@email.com</Text>
        <Text style={styles.subText}>Email Address</Text>
      </View>

      <TouchableOpacity style={styles.secondaryBtn}>
        <Text>Email</Text>
      </TouchableOpacity>
    </View>

  </View>
</View>
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Personal Information</Text>

  <View style={styles.card}>
    <View style={styles.infoRow}>
      <Text style={styles.label}>Date of Birth</Text>
      <Text style={styles.value}>15 Mar 2010</Text>
    </View>

    <View style={styles.infoRow}>
      <Text style={styles.label}>Blood Group</Text>
      <Text style={styles.value}>O+</Text>
    </View>

    <View style={styles.infoRow}>
      <Text style={styles.label}>Address</Text>
      <Text style={styles.value}>123 Main Street, City</Text>
    </View>
  </View>
</View>


<View
  style={styles.section}
  onLayout={(event) => setExamSectionY(event.nativeEvent.layout.y)}
>
  <Text style={styles.sectionTitle}>Recent Exam Results</Text>

  {/* Exam 1 */}
  <View style={styles.examCard}>
    <View style={{ flex: 1 }}>
      <Text style={styles.examTitle}>Half Yearly Exam 2025-26</Text>
      <Text style={styles.examSub}>December 2025</Text>
    </View>

    <View style={{ alignItems: "flex-end" }}>
      <Text style={styles.examPercent}>87%</Text>
      <Text style={styles.examMarks}>435/500</Text>
    </View>
  </View>

  {/* Exam 2 */}
  <View style={styles.examCard}>
    <View style={{ flex: 1 }}>
      <Text style={styles.examTitle}>Unit Test 3</Text>
      <Text style={styles.examSub}>November 2025</Text>
    </View>

    <View style={{ alignItems: "flex-end" }}>
      <Text style={styles.examPercent}>87.2%</Text>
      <Text style={styles.examMarks}>218/250</Text>
    </View>
  </View>

  {/* Exam 3 */}
  <View style={styles.examCard}>
    <View style={{ flex: 1 }}>
      <Text style={styles.examTitle}>Mid Term Exam 2025-26</Text>
      <Text style={styles.examSub}>September 2025</Text>
    </View>

    <View style={{ alignItems: "flex-end" }}>
      <Text style={styles.examPercent}>83%</Text>
      <Text style={styles.examMarks}>415/500</Text>
    </View>
  </View>
</View>
  </ScrollView>
);
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#2563eb",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  back: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 10,
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  subtitle: {
    color: "#c7d2fe",
    marginBottom: 16,
  },

  profileCard: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },

  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  subText: {
    color: "#6b7280",
  fontSize: 12,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statBox: {
    backgroundColor: "#1e40af",
    padding: 14,
    borderRadius: 14,
    width: "30%",
    alignItems: "center",
  },

  statLabel: {
    color: "#c7d2fe",
    fontSize: 12,
  },

  green: {
    color: "#22c55e",
    fontWeight: "700",
  },

  yellow: {
    color: "#facc15",
    fontWeight: "700",
  },

  white: {
    color: "#fff",
    fontWeight: "700",
  },
  tabsContainer: {
  flexDirection: "row",
  backgroundColor: "#fff",
  marginHorizontal: 16,
  marginTop: 6,
  borderRadius: 16,
  padding: 6,
  justifyContent: "space-between",
  elevation: 2,
},

tab: {
  flex: 1,
  alignItems: "center",
  paddingVertical: 10,
  borderRadius: 12,
},

activeTab: {
  backgroundColor: "#e0e7ff",
},

tabText: {
  fontSize: 12,
  color: "#6b7280",
},

activeTabText: {
  color: "#2563eb",
  fontWeight: "600",
},
section: {
  marginTop: 20,
  paddingHorizontal: 16,
},

sectionTitle: {
  fontSize: 16,
  fontWeight: "600",
  marginBottom: 10,
},

card: {
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 16,
    shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 3,
},

row: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 16,
},

avatarCircle: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: "#9333ea",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12,
},

parentName: {
  fontWeight: "600",
},
contactRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
},

contactText: {
  fontWeight: "500",
},

callBtn: {
  backgroundColor: "#2563eb",
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 8,
},

secondaryBtn: {
  borderWidth: 1,
  borderColor: "#ddd",
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 8,
},
infoRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 10,
},

label: {
  color: "#6b7280",
},

value: {
  fontWeight: "600",
},
examCard: {
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 16,
  marginBottom: 12,
  flexDirection: "row",
  alignItems: "center",
},
examSub: {
  fontSize: 12,
  color: "#6b7280",
  marginTop: 4,
},

examPercent: {
  color: "#2563eb",
  fontWeight: "700",
  fontSize: 16,
},

examMarks: {
  fontSize: 12,
  color: "#6b7280",
  marginTop: 4,
},
examTitle: {
  fontWeight: "600",
  fontSize: 14,
},
});