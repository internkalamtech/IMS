import React from "react";
import { ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/presentation/components/ThemedText";
import { QuickActionGrid } from "@/presentation/components/dashboard/QuickActionGrid";
import { RecentUpdates } from "@/presentation/components/dashboard/RecentUpdates";
import { QuickAction } from "@/core/config/dashboard";

const Teacher2Dashboard = () => {
    const actions: QuickAction[] = 
    [
        { id: 1, title: "Timetable", icon: "calendar-outline", color: "#3B82F6" },

        { id: 2, title: "Attendance", icon: "person-outline", color: "#3B82F6" },

        { id: 3, title: "Students", icon: "people-outline", color: "#10B981" },

        { id: 4, title: "Assessments", icon: "medal-outline", color: "#EF4444" },

        { id: 5, title: "Academics", icon: "book-outline", color: "#8B5CF6" },

        { id: 6, title: "Leave Requests", icon: "checkbox-outline", color: "#F59E0B" },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: "#F5F7FB" }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ backgroundColor: "#F5F7FB" }} // ✅ FIX scroll bg
            >

                {/* 🔵 HEADER */}
                <View style={styles.header}>

                    <ThemedText style={styles.teacherName}>
                        Miss Jennie Ruby
                    </ThemedText>

                    <ThemedText style={styles.subtitle}>
                        Computer Science Teacher
                    </ThemedText>

                    {/* CENTER */}
                    <View style={styles.centerContent}>

                        <ThemedText style={styles.smallText}>
                            Current Class
                        </ThemedText>

                        {/* CLASS + ARROWS */}
                        <View style={styles.classRow}>
                            <TouchableOpacity style={styles.arrowBtn}>
                                <Ionicons name="chevron-back" size={18} color="#333" />
                            </TouchableOpacity>

                            <ThemedText style={styles.classText}>
                                Class 7A
                            </ThemedText>

                            <TouchableOpacity style={styles.arrowBtn}>
                                <Ionicons name="chevron-forward" size={18} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ThemedText style={styles.subjectText}>
                            Computer Science
                        </ThemedText>

                        <View style={styles.row}>
                            <ThemedText style={styles.badge}>
                                38 Students
                            </ThemedText>

                            <ThemedText style={styles.present}>
                                ✓ 35 Present
                            </ThemedText>
                        </View>

                    </View>
                </View>

                {/* QUICK ACTIONS TITLE */}
                <View style={styles.sectionHeader}>
                    <ThemedText style={styles.sectionTitle}>
                        Quick Actions
                    </ThemedText>
                </View>

                {/* GRID */}
                <View style={styles.gridWrapper}>
                    <QuickActionGrid actions={actions} />
                </View>

                {/* RECENT UPDATES */}
                <View style={styles.updateWrapper}>
                    <RecentUpdates />
                </View>

            </ScrollView>
        </View>
    );
};

export default Teacher2Dashboard;

const styles = StyleSheet.create({

    header: {
        backgroundColor: "#1667c3",
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 25,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },

    teacherName: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },

    subtitle: {
        color: "#E0E0E0",
        fontSize: 12,
        marginBottom: 10,
    },


    centerContent: {
        alignItems: "center",
        marginTop: 10,
        backgroundColor: "rgba(255,255,255,0.12)",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },

    smallText: {
        color: "#D0D8FF",
        fontSize: 12,
    },

    classRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between", 
        width: "100%", 
        marginVertical: 5,
    },

    classText: {
        color: "#fff",
        fontSize: 30,
        fontWeight: "700",
        textAlign: "center",
        flex: 1, 
    },

    arrowBtn: {
        backgroundColor: "#fff",
        padding: 6,
        borderRadius: 20,
    },

    subjectText: {
        color: "#E0E0E0",
        fontSize: 14,
    },

    row: {
        flexDirection: "row",
        marginTop: 8,
    },

    badge: {
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        color: "#fff",
        fontSize: 12,
        marginRight: 10,
    },

    present: {
        color: "#A4FBA6",
        fontSize: 12,
    },

    sectionHeader: {
        marginTop: 16,
        paddingHorizontal: 16,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },

    gridWrapper: {
        marginTop: 10,
        paddingHorizontal: 10,
    },


    updateWrapper: {
        marginTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 100,
        backgroundColor: "#F5F7FB",
    },

});