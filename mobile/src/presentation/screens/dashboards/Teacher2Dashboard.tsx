import React from "react";
import {
    ScrollView,
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { QuickActionGrid } from "@/presentation/components/dashboard/QuickActionGrid";
import { RecentUpdates } from "@/presentation/components/dashboard/RecentUpdates";
import { useTeacher2Dashboard } from "@/presentation/hooks/useTeacher2Dashboard";

/* Quick Actions */
const actions = [
    { id: 1, title: "Timetable", icon: "calendar-outline", color: "#3B82F6", route: "/timetable" },
    { id: 2, title: "Attendance", icon: "person-outline", color: "#3B82F6", route: "/attendance" },
    { id: 3, title: "Students", icon: "people-outline", color: "#10B981", route: "/students" },
    { id: 4, title: "Assessments", icon: "medal-outline", color: "#EF4444", route: "/assessments" },
    { id: 5, title: "Academics", icon: "book-outline", color: "#8B5CF6", route: "/academics" },
    { id: 6, title: "Leave Requests", icon: "checkbox-outline", color: "#F59E0B", route: "/leave" },
];

const Teacher2Dashboard = () => {
    const { data, loading, refreshing, onRefresh } = useTeacher2Dashboard();

    if (loading) {
        return <View style={{ flex: 1, backgroundColor: "#F5F7FB" }} />;
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#F5F7FB" }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.teacherName}>
                        {data?.teacher?.name || ""}
                    </Text>

                    <Text style={styles.subtitle}>
                        {data?.teacher?.subject || ""}
                    </Text>

                    <View style={styles.centerContent}>
                        <Text style={styles.smallText}>Current Class</Text>

                        <View style={styles.classRow}>
                            <TouchableOpacity style={styles.arrowBtn}>
                                <Ionicons name="chevron-back" size={18} color="#333" />
                            </TouchableOpacity>

                            <Text style={styles.classText}>
                                {data?.teacher?.className || ""}
                            </Text>

                            <TouchableOpacity style={styles.arrowBtn}>
                                <Ionicons name="chevron-forward" size={18} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.subjectText}>
                            {data?.teacher?.subject || ""}
                        </Text>

                        <View style={styles.row}>
                            <Text style={styles.badge}>
                                {data?.stats?.totalStudents ?? 0} Students
                            </Text>

                            <Text style={styles.present}>
                                ✓ {data?.stats?.presentStudents ?? 0} Present
                            </Text>
                        </View>
                    </View>
                </View>

                {/* QUICK ACTIONS */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        Quick Actions
                    </Text>
                </View>

                <View style={styles.gridWrapper}>
                    <QuickActionGrid
                        actions={actions}
                        onActionPress={(action) => {
                            console.log("Navigate:", action.route);
                        }}
                    />
                </View>

                {/* RECENT UPDATES */}
                <View style={styles.updateWrapper}>
                    <RecentUpdates
                        updates={(data?.recentUpdates || []).map((item: any) => ({
                            id: String(item.id),
                            title: item.title,
                            description: item.description ?? "",
                            time: item.createdAt ?? "Just now",
                        }))}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

export default Teacher2Dashboard;

/* Styles (unchanged) */
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
        padding: 12,
        borderRadius: 16,
    },
    smallText: {
        color: "#D0D8FF",
        fontSize: 12,
    },
    classRow: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginVertical: 5,
    },
    classText: {
        color: "#fff",
        fontSize: 30,
        fontWeight: "700",
        flex: 1,
        textAlign: "center",
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
    },
    gridWrapper: {
        marginTop: 10,
        paddingHorizontal: 10,
    },
    updateWrapper: {
        marginTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
});