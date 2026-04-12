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

export default function AdminDashboard() {
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { logout, user } = useAuth();
    const { data: dashboardData, refreshing, onRefresh } = useDashboard();
    const { theme, isDark } = useTheme();

    const userRepository = new UserRepositoryImpl();
    const quickActions = DASHBOARD_CONFIG.admin.quickActions;

    const handleActionPress = (action: any) => {
        if (action.title === "Manage Classes") {
            router.push("/manage-classes");
        }
    };

    const getStatValue = (label: string, defaultValue: string = '0') => {
        return dashboardData?.stats?.find(s => s.label === label)?.value || defaultValue;
    };

    const stats = [
        { title: 'Total Students', value: getStatValue('Total Students'), icon: 'people' },
        { title: 'Total Teachers', value: getStatValue('Total Teachers'), icon: 'school' },
    ];

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

            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
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
                        </View>

                        <View style={styles.stats}>
                            {stats.map((s, i) => (
                                <View key={i} style={styles.statBox}>
                                    <Ionicons name={s.icon as any} size={20} />
                                    <ThemedText>{s.value}</ThemedText>
                                    <ThemedText>{s.title}</ThemedText>
                                </View>
                            ))}
                        </View>
                    </SafeAreaView>
                </View>

                <QuickActionGrid actions={quickActions} onActionPress={handleActionPress} />

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
    container: { flex: 1 },
    banner: { padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between' },
    stats: { flexDirection: 'row', gap: 10 },
    statBox: { padding: 10, backgroundColor: '#fff' },
    modal: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalBox: { backgroundColor: '#fff', padding: 20, width: '80%' }
});