import { DASHBOARD_CONFIG } from '@/core/config/dashboard';
import { useTheme } from '@/core/theme/ThemeContext';
import { QuickActionGrid } from '@/presentation/components/dashboard/QuickActionGrid';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useDashboard } from '@/presentation/hooks/useDashboard';
import { UserRepositoryImpl } from '@/data/repositories/user-repository-impl';
import { Ionicons } from '@expo/vector-icons';
<<<<<<< HEAD

import React, { useState } from 'react';
import { router } from "expo-router";

import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  Button,
  Alert
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

=======
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshControl,
        ScrollView,
        StatusBar,
        TouchableOpacity,
        View,
        StyleSheet
       } from "react-native";
>>>>>>> 108e7a58ce795d7ea23ae909095c1d92aad03e60
export default function AdminDashboard() {
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { logout, user } = useAuth();
    const router = useRouter();
    const { data: dashboardData, refreshing, onRefresh } = useDashboard();
    const { theme, isDark } = useTheme();

    const userRepository = new UserRepositoryImpl();
    const quickActions = DASHBOARD_CONFIG.admin.quickActions;

    const handleActionPress = (action: any) => {
<<<<<<< HEAD
        if (action.title === "Manage Classes") {
            router.push("/manage-classes");
        }
=======
      if (action.title === "Manage Classes") {
        router.push("/manage-classes"); // ✅ NOT inside tabs
      } else if (action.title === "Manage Users") {
        router.push("/add-user"); // ✅ Navigate to add user screen
      }
>>>>>>> 108e7a58ce795d7ea23ae909095c1d92aad03e60
    };

    const getStatValue = (label: string, defaultValue: string = '0') => {
        return dashboardData?.stats?.find(s => s.label === label)?.value || defaultValue;
    };

    const stats = [
        { title: 'Total Students', value: getStatValue('Total Students'), icon: 'people' },
        { title: 'Total Teachers', value: getStatValue('Total Teachers'), icon: 'school' },
    ];
<<<<<<< HEAD

    const handleSubmit = async () => {
        if (!name.trim() || !email.trim()) {
            Alert.alert('Validation Error', 'Please fill all fields');
            return;
        }

        setIsSubmitting(true);
        try {
            await userRepository.createUser({ name, email });

            Alert.alert('Success', 'User created successfully');
            setName("");
            setEmail("");
            setModalVisible(false);
            onRefresh();
        } catch (error) {
            Alert.alert('Error', 'Failed to create user');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

=======
return (
    <ThemedView style={styles.container}>
            <StatusBar barStyle={ theme.dark ? "light-content" : "dark-content" } backgroundColor={theme.colors.background} />
>>>>>>> 108e7a58ce795d7ea23ae909095c1d92aad03e60
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
<<<<<<< HEAD
                <View style={[styles.banner, { backgroundColor: theme.colors.primary }]}>
                    <SafeAreaView edges={['top']}>
                        <View style={styles.header}>
                            <ThemedText type="title">
                                {user?.name || 'Admin'}
                            </ThemedText>

                            <TouchableOpacity onPress={() => setModalVisible(true)}>
                                <Ionicons name="person-add-outline" size={24} color="#fff" />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={logout}>
                                <Ionicons name="log-out-outline" size={24} color="#fff" />
                            </TouchableOpacity>
=======
            {/* Blue Banner Header */}
            <View style={[styles.banner, { backgroundColor: theme.colors.primary }]}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <View>
                            <ThemedText style={styles.userName} type="title" lightColor={theme.colors.primaryForeground} darkColor={theme.colors.primaryForeground}>
                                    {user?.name || 'Admin'}
                            </ThemedText>
                            <ThemedText style={styles.subtitle} lightColor={theme.colors.primaryForeground}
                             darkColor={theme.colors.primaryForeground}>
                                Institute Management Overview
                            </ThemedText>
>>>>>>> 108e7a58ce795d7ea23ae909095c1d92aad03e60
                        </View>
                        <TouchableOpacity onPress={logout} style={styles.logoutIcon}>
                            <Ionicons name="log-out-outline" size={24} color={theme.colors.primaryForeground} />
                        </TouchableOpacity>
                    </View>

<<<<<<< HEAD
                        <View style={styles.stats}>
                            {stats.map((s, i) => (
                                <View key={i} style={styles.statBox}>
                                    <Ionicons name={s.icon as any} size={20} />
                                    <ThemedText>{s.value}</ThemedText>
                                    <ThemedText>{s.title}</ThemedText>
=======
                    {/* Banner Stats */}
                        <View style={styles.bannerStats}>
                            {stats.map((stat, index) => (
                                <View key={index} style={[styles.bannerStatCard, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                                    <View style={styles.statIconContainer}>
                                        <Ionicons name={stat.icon as any} size={24} color={theme.colors.primaryForeground} />
                                    </View>
                                    <View>
                                        <ThemedText style={styles.bannerStatValue} type="title" lightColor={theme.colors.primaryForeground} darkColor={theme.colors.primaryForeground}>{stat.value}</ThemedText>
                                        <ThemedText style={styles.bannerStatTitle} lightColor={theme.colors.primaryForeground} darkColor={theme.colors.primaryForeground}>
                                            {stat.title}
                                        </ThemedText>
                                    </View>
>>>>>>> 108e7a58ce795d7ea23ae909095c1d92aad03e60
                                </View>
                            ))}
                        </View>
                    </SafeAreaView>
                </View>

                <QuickActionGrid actions={quickActions} onActionPress={handleActionPress} />

<<<<<<< HEAD
=======
                    <QuickActionGrid actions={quickActions} onActionPress={handleActionPress} />

                    {/* Recent Updates */}
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle} type="subtitle">Recent Updates</ThemedText>
                        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                            <ThemedText style={styles.badgeText} lightColor={theme.colors.primaryForeground} darkColor={theme.colors.primaryForeground} >3 new</ThemedText>
                        </View>
                    </View>
                    <ThemedCard style={styles.updatesCard} padding={0}>
                        {[1, 2, 3].map((item, index) => (
                            <View key={item} style={[
                                styles.updateItem,
                                index !== 2 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }
                            ]}>
                                <View style={[styles.updateIcon, { backgroundColor: theme.colors.primary + '10' }]}>
                                    <Ionicons name="people-outline" size={20} color={theme.colors.primary} />
                                </View>
                                <View style={styles.updateContent}>
                                    <ThemedText style={styles.updateTitle} type="defaultSemiBold">New Student Enrolled</ThemedText>
                                    <ThemedText style={styles.updateSubtitle} lightColor="#666" darkColor="#999">Class 7-B • Roll 24</ThemedText>
                                    <ThemedText style={styles.updateTime} lightColor="#999" darkColor="#aaa">2 hours ago</ThemedText>
                                </View>
                                <TouchableOpacity>
                                    <ThemedText style={styles.viewLink} type="link">View →</ThemedText>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ThemedCard>
                </View>
>>>>>>> 108e7a58ce795d7ea23ae909095c1d92aad03e60
            </ScrollView>

            {/* Modal */}
            <Modal visible={modalVisible} transparent>
                <View style={styles.modal}>
                    <View style={styles.modalBox}>
                        <TextInput placeholder="Name" value={name} onChangeText={setName} />
                        <TextInput placeholder="Email" value={email} onChangeText={setEmail} />

                        <Button title="Submit" onPress={handleSubmit} />
                        <Button title="Cancel" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>

        </ThemedView>
    );
}
const styles = StyleSheet.create({
<<<<<<< HEAD
    container: { flex: 1 },
    banner: { padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between' },
    stats: { flexDirection: 'row', gap: 10 },
    statBox: { padding: 10, backgroundColor: '#fff' },
    modal: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalBox: { backgroundColor: '#fff', padding: 20, width: '80%' }
});
=======
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
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
        marginBottom: 4,
    },
    subtitle: {
        marginTop: 4,
    },
    logoutIcon: {
        padding: 8,
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
    },
    statIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerStatValue: {
        marginBottom: 4,
    },
    bannerStatTitle: {
        marginTop: 4,
    },
    mainContent: {
        flex: 1,
        marginTop: 0,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        marginBottom: 4,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 12,
    },
    badgeText: {
        marginTop: 2,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    quickActionItem: {
        width: '32%',
        alignItems: 'center',
        marginBottom: 24,
    },
    quickActionIcon: {
        width: 60,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionLabel: {
        marginTop: 8,
        textAlign: 'center',
    },
    updatesCard: {
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 40,
    },
    updateItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    updateIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    updateContent: {
        flex: 1,
    },
    updateTitle: {
        marginBottom: 2,
    },
    updateSubtitle: {
        marginBottom: 4,
    },
    updateTime: {
        marginTop: 4,
    },
    viewLink: {
        fontWeight: '600',
    },
});

>>>>>>> 108e7a58ce795d7ea23ae909095c1d92aad03e60
