import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/presentation/hooks/useAuth'; // ✅ ADDED

export default function ProfileScreen() {
    const router = useRouter();
    const { logout } = useAuth(); // ✅ ADDED

    const [notifications, setNotifications] = useState({
        push: true,
        email: true,
        sms: false,
    });

    const profile = {
        name: 'Miss Jennie Ruby',
        role: 'Computer Science Teacher',
        email: 'jennie.ruby@school.edu',
        phone: '+91 98765 43210',
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile & Settings</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

                {/* PROFILE CARD */}
                <View style={styles.profileCard}>
                    <View style={styles.profileRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>MR</Text>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.name}>{profile.name}</Text>
                            <Text style={styles.role}>{profile.role}</Text>

                            <TouchableOpacity style={styles.editBtn}>
                                <Text style={styles.editText}>Edit Profile</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* EMAIL */}
                    <View style={styles.infoRow}>
                        <View style={[styles.iconBox, { backgroundColor: '#E7F0FF' }]}>
                            <Ionicons name="mail-outline" size={20} color="#2563EB" />
                        </View>
                        <View>
                            <Text style={styles.label}>Email</Text>
                            <Text style={styles.value}>{profile.email}</Text>
                        </View>
                    </View>

                    {/* PHONE */}
                    <View style={styles.infoRow}>
                        <View style={[styles.iconBox, { backgroundColor: '#E6F7EC' }]}>
                            <Ionicons name="call-outline" size={20} color="#16A34A" />
                        </View>
                        <View>
                            <Text style={styles.label}>Phone</Text>
                            <Text style={styles.value}>{profile.phone}</Text>
                        </View>
                    </View>

                    {/* ROLE */}
                    <View style={styles.infoRow}>
                        <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
                            <Ionicons name="shield-outline" size={20} color="#9333EA" />
                        </View>
                        <View>
                            <Text style={styles.label}>Role</Text>
                            <Text style={styles.value}>{profile.role}</Text>
                        </View>
                    </View>
                </View>

                {/* NOTIFICATIONS */}
                <Text style={styles.sectionTitle}>Notifications</Text>

                <View style={styles.card}>
                    {[
                        {
                            key: 'push',
                            title: 'Push Notifications',
                            subtitle: 'Receive alerts and updates',
                            icon: 'notifications-outline',
                            color: '#2563EB',
                            bg: '#E7F0FF',
                        },
                        {
                            key: 'email',
                            title: 'Email Notifications',
                            subtitle: 'Get updates via email',
                            icon: 'mail-outline',
                            color: '#16A34A',
                            bg: '#E6F7EC',
                        },
                        {
                            key: 'sms',
                            title: 'SMS Notifications',
                            subtitle: 'Receive text messages',
                            icon: 'chatbubble-outline',
                            color: '#9333EA',
                            bg: '#F3E8FF',
                        },
                    ].map((item, index) => (
                        <View key={item.key}>
                            <View style={styles.toggleRow}>
                                <View style={styles.toggleLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                                        <Ionicons name={item.icon} size={20} color={item.color} />
                                    </View>
                                    <View>
                                        <Text style={styles.toggleTitle}>{item.title}</Text>
                                        <Text style={styles.subText}>{item.subtitle}</Text>
                                    </View>
                                </View>

                                <Switch
                                    value={notifications[item.key]}
                                    onValueChange={(v) =>
                                        setNotifications(prev => ({ ...prev, [item.key]: v }))
                                    }
                                />
                            </View>

                            {index !== 2 && <View style={styles.separator} />}
                        </View>
                    ))}
                </View>

                {/* SUPPORT */}
                <Text style={styles.sectionTitle}>Support</Text>

                <View style={styles.card}>
                    <View style={styles.linkRow}>
                        <View style={[styles.iconBox, { backgroundColor: '#FFF4E6' }]}>
                            <Ionicons name="help-circle-outline" size={20} color="#F97316" />
                        </View>
                        <Text style={styles.linkText}>Help & Support</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.linkRow}>
                        <View style={[styles.iconBox, { backgroundColor: '#E7F0FF' }]}>
                            <Ionicons name="shield-outline" size={20} color="#2563EB" />
                        </View>
                        <Text style={styles.linkText}>Privacy Policy</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </View>
                </View>

                {/* FOOTER */}
                <View style={styles.footer}>
                    <Text style={styles.appName}>KalamTech</Text>
                    <Text style={styles.version}>Version 1.0.0</Text>
                    <Text style={styles.copy}>© 2025 Smart Institute Management</Text>
                </View>

                {/* LOGOUT */}
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <Ionicons name="log-out-outline" size={20} color="#fff" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F6FA' },

    header: {
        backgroundColor: '#2563EB',
        padding: 16,
        paddingBottom: 30,
    },

    headerTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
        marginTop: 10,
    },

    profileCard: {
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 20,
        padding: 20,
        elevation: 5,
    },

    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },

    avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },

    name: { fontSize: 18, fontWeight: '700' },
    role: { color: '#6B7280', marginBottom: 10 },

    editBtn: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },

    editText: { fontWeight: '600' },

    divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 15 },

    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },

    iconBox: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    label: { fontSize: 12, color: '#9CA3AF' },
    value: { fontWeight: '600' },

    sectionTitle: {
        marginLeft: 16,
        marginBottom: 8,
        fontWeight: '700',
    },

    card: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
    },

    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    toggleLeft: { flexDirection: 'row', alignItems: 'center' },

    toggleTitle: { fontWeight: '600' },
    subText: { fontSize: 12, color: '#6B7280' },

    separator: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },

    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    linkText: { flex: 1, marginLeft: 10 },

    footer: { alignItems: 'center', marginVertical: 20 },

    appName: { fontWeight: '700' },
    version: { color: '#6B7280' },
    copy: { color: '#9CA3AF', fontSize: 12 },

    logoutBtn: {
        flexDirection: 'row',
        backgroundColor: '#EF4444',
        margin: 16,
        padding: 14,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    logoutText: { color: '#fff', marginLeft: 8, fontWeight: '600' },
});