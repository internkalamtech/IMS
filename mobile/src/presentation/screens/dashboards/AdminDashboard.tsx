import { DASHBOARD_CONFIG } from '@/core/config/dashboard';
import { useTheme } from '@/core/theme/ThemeContext';
import { QuickActionGrid } from '@/presentation/components/dashboard/QuickActionGrid';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useDashboard } from '@/presentation/hooks/useDashboard';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function AdminDashboard() {

    const { logout, user } = useAuth();
    const { data: dashboardData, refreshing, onRefresh } = useDashboard();
    const { theme, isDark } = useTheme();

    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const addUser = async () => {

        console.log("Submit button clicked");

        try {

            const response = await fetch("http://localhost:8000/add-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    email: email
                })
            });

            const data = await response.json();
            console.log("Server response:", data);

            alert("User Added Successfully");

            setOpen(false);
            setName("");
            setEmail("");

        } catch (error) {

            console.log("Error:", error);
            alert("API Error");

        }
    };

    const quickActions = DASHBOARD_CONFIG.admin.quickActions;

    const getStatValue = (label: string, defaultValue: string = '0') => {
        return dashboardData?.stats?.find(s => s.label === label)?.value || defaultValue;
    };

    const stats = [
        { title: 'Total Students', value: getStatValue('Total Students'), icon: 'people' },
        { title: 'Total Teachers', value: getStatValue('Total Teachers'), icon: 'school' },
    ];

    return (

        <ThemedView style={styles.container}>

            <StatusBar barStyle={isDark ? "light-content" : "light-content"} />

            <Modal visible={open} transparent animationType="slide">

                <View style={styles.modalContainer}>

                    <View style={styles.modalBox}>

                        <Text style={styles.modalTitle}>Add User</Text>

                        <TextInput
                            placeholder="Name"
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                        />

                        <TextInput
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                        />

                        <TouchableOpacity
                            onPress={addUser}
                            style={styles.submitBtn}
                        >
                            <Text style={styles.btnText}>Submit</Text>
                        </TouchableOpacity>

                    </View>

                </View>

            </Modal>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
            >

                <View style={[styles.banner, { backgroundColor: theme.colors.primary }]}>

                    <SafeAreaView edges={['top']}>

                        <View style={styles.headerContent}>

                            <View>

                                <ThemedText style={styles.userName} type="title" color="primaryForeground">
                                    {user?.name || 'Admin'}
                                </ThemedText>

                                <ThemedText style={styles.subtitle} color="primaryForeground">
                                    Institute Management Overview
                                </ThemedText>

                            </View>

                            <View style={{ flexDirection: "row", gap: 10 }}>

                                <TouchableOpacity onPress={() => setOpen(true)}>
                                    <Ionicons name="person-add-outline" size={24} color="white" />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={logout}>
                                    <Ionicons name="log-out-outline" size={24} color="white" />
                                </TouchableOpacity>

                            </View>

                        </View>

                        <View style={styles.bannerStats}>

                            {stats.map((stat, index) => (

                                <View key={index} style={styles.bannerStatCard}>

                                    <Ionicons name={stat.icon as any} size={24} color="white" />

                                    <View>

                                        <ThemedText style={styles.bannerStatValue} color="primaryForeground">
                                            {stat.value}
                                        </ThemedText>

                                        <ThemedText style={styles.bannerStatTitle} color="primaryForeground">
                                            {stat.title}
                                        </ThemedText>

                                    </View>

                                </View>

                            ))}

                        </View>

                    </SafeAreaView>

                </View>

                <View style={[styles.mainContent, { backgroundColor: theme.colors.background }]}>

                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">
                            Quick Actions
                        </ThemedText>
                    </View>

                    <QuickActionGrid actions={quickActions} />

                    <ThemedCard style={styles.updatesCard}>
                        <Text>Recent Updates</Text>
                    </ThemedCard>

                </View>

            </ScrollView>

        </ThemedView>

    );

}

const styles = StyleSheet.create({

    container: { flex: 1 },

    scrollView: { flex: 1 },

    scrollContent: { flexGrow: 1 },

    banner: {
        paddingBottom: 30,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },

    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
    },

    userName: {
        fontSize: 28,
        fontWeight: '700',
    },

    subtitle: {
        fontSize: 16,
        marginTop: 4,
    },

    bannerStats: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
    },

    bannerStatCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        gap: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },

    bannerStatValue: {
        fontSize: 22,
        fontWeight: '700',
    },

    bannerStatTitle: {
        fontSize: 12,
    },

    mainContent: {
        flex: 1,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 32,
    },

    sectionHeader: {
        marginBottom: 20,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
    },

    updatesCard: {
        marginTop: 20,
        padding: 20,
    },

    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)"
    },

    modalBox: {
        width: "80%",
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10
    },

    modalTitle: {
        fontSize: 18,
        marginBottom: 10
    },

    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        marginBottom: 10,
        borderRadius: 5
    },

    submitBtn: {
        backgroundColor: "#2563eb",
        padding: 12,
        borderRadius: 6
    },

    btnText: {
        color: "white",
        textAlign: "center",
        fontWeight: "bold"
    }

});