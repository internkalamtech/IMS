import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { QuickActionGrid } from "@/presentation/components/dashboard/QuickActionGrid";
import { RecentUpdates } from "@/presentation/components/dashboard/RecentUpdates";
import { DASHBOARD_CONFIG } from "@/core/config/dashboard";
//import { API_BASE_URL } from "@/core/config/api";
import { useRouter } from 'expo-router';
const quickActions =
    DASHBOARD_CONFIG?.teacher?.quickActions || [];


const Teacher2Dashboard = () => {
    const [updates, setUpdates] = useState<any[]>([]);
    const [loaded, setLoaded] = useState(false); // ✅ prevent premature render
const router = useRouter();

const handleQuickActionPress = (action: any) => {
  if (action.route) {
    router.push(action.route as any);
  }
};
    useEffect(() => {
        const fetchUpdates = async () => {
            try {
                //const res = await fetch(`${API_BASE_URL}/teacher2/updates/1`);
                //const json = await res.json();

                //setUpdates(Array.isArray(json?.data) ? json.data : []);
            } catch (e) {
                console.log("API error:", e);
            } finally {
                setLoaded(true); // ✅ mark ready
            }
        };

        fetchUpdates();
    }, []);

    // ✅ WAIT until mounted properly (prevents context crash)
    if (!loaded) {
        return <View style={{ flex: 1, backgroundColor: "#F5F7FB" }} />;
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#F5F7FB" }}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.teacherName}>Miss Jennie Ruby</Text>
                    <Text style={styles.subtitle}>Computer Science Teacher</Text>

                    <View style={styles.centerContent}>
                        <Text style={styles.smallText}>Current Class</Text>

                        <View style={styles.classRow}>
                            <TouchableOpacity style={styles.arrowBtn}>
                                <Ionicons name="chevron-back" size={18} color="#333" />
                            </TouchableOpacity>

                            <Text style={styles.classText}>Class 7A</Text>

                            <TouchableOpacity style={styles.arrowBtn}>
                                <Ionicons name="chevron-forward" size={18} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.subjectText}>Computer Science</Text>

                        <View style={styles.row}>
                            <Text style={styles.badge}>38 Students</Text>
                            <Text style={styles.present}>✓ 35 Present</Text>
                        </View>
                    </View>
                </View>

                {/* QUICK ACTIONS */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                </View>

                <View style={styles.gridWrapper}>
                    <QuickActionGrid
                      actions={quickActions}
                      onActionPress={handleQuickActionPress}
                    />
                </View>

                {/* RECENT UPDATES */}
                <View style={styles.updateWrapper}>
                    <RecentUpdates updates={updates} />
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
        padding: 12,
        borderRadius: 16,
    },
    smallText: { color: "#D0D8FF", fontSize: 12 },
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
    subjectText: { color: "#E0E0E0", fontSize: 14 },
    row: { flexDirection: "row", marginTop: 8 },
    badge: {
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        color: "#fff",
        marginRight: 10,
    },
    present: { color: "#A4FBA6", fontSize: 12 },
    sectionHeader: { marginTop: 16, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 16, fontWeight: "600" },
    gridWrapper: { marginTop: 10, paddingHorizontal: 10 },
    updateWrapper: { marginTop: 16, paddingHorizontal: 16, paddingBottom: 100 },
});