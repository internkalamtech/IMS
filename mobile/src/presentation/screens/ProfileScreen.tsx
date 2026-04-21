import { useTheme } from '@/core/theme/ThemeContext';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { useAuth } from '@/presentation/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const { theme, setThemeType, themeType } = useTheme();

    // ✅ NEW: Tab State
    const [activeTab, setActiveTab] = useState<'overview' | 'exams' | 'attendance' | 'conduct'>('overview');

    const themeOptions = [
        { id: 'light', label: 'Light', icon: 'sunny-outline' },
        { id: 'dark', label: 'Dark', icon: 'moon-outline' },
        { id: 'system', label: 'System', icon: 'settings-outline' },
    ] as const;

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                    <ThemedText type="title">Profile</ThemedText>
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    {/* ✅ EXISTING USER INFO (UNCHANGED) */}
                    <View style={styles.userCard}>
                        <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
                            <ThemedText style={{ color: theme.colors.primary, fontSize: 32, fontWeight: '700' }}>
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                            </ThemedText>
                        </View>
                        <View style={styles.userInfo}>
                            <ThemedText type="subtitle">{user?.name}</ThemedText>
                            <ThemedText lightColor="#666">{user?.email}</ThemedText>
                            <View style={[styles.roleBadge, { backgroundColor: theme.colors.primary }]}>
                                <ThemedText style={styles.roleText}>{user?.role?.toUpperCase()}</ThemedText>
                            </View>

                            {/* ✅ NEW: Student Details (SAFE FALLBACKS) */}
                            <ThemedText style={styles.extraDetail}>
                                Roll No: {user?.rollNumber || 'N/A'}
                            </ThemedText>
                            <ThemedText style={styles.extraDetail}>
                                Parent: {user?.parentContact || 'N/A'}
                            </ThemedText>
                        </View>
                    </View>

                    {/* ✅ NEW: TABS */}
                    <View style={[styles.tabs, { borderBottomColor: theme.colors.border }]}>
                        {['overview', 'exams', 'attendance', 'conduct'].map((tab) => (
                            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab as any)}>
                                <ThemedText
                                    style={[
                                        styles.tab,
                                        activeTab === tab && {
                                            color: theme.colors.primary,
                                            borderBottomColor: theme.colors.primary,
                                            borderBottomWidth: 2
                                        }
                                    ]}
                                >
                                    {tab.toUpperCase()}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* ✅ NEW: OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <View style={styles.cardContainer}>
                            <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                                <ThemedText style={styles.cardTitle}>Current Rank</ThemedText>
                                <ThemedText style={styles.cardValue}>
                                    {user?.rank || 'N/A'}
                                </ThemedText>
                            </View>

                            <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                                <ThemedText style={styles.cardTitle}>Attendance %</ThemedText>
                                <ThemedText style={styles.cardValue}>
                                    {user?.attendance || '0'}%
                                </ThemedText>
                            </View>
                        </View>
                    )}

                    {/* ✅ NEW: OTHER TABS PLACEHOLDER */}
                    {activeTab === 'exams' && <ThemedText>Exams data coming soon</ThemedText>}
                    {activeTab === 'attendance' && <ThemedText>Attendance details coming soon</ThemedText>}
                    {activeTab === 'conduct' && <ThemedText>Conduct info coming soon</ThemedText>}

                    {/* ✅ EXISTING THEME SETTINGS (UNCHANGED) */}
                    <ThemedText style={styles.sectionTitle} type="subtitle">Appearance</ThemedText>
                    <View style={[styles.settingsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        {themeOptions.map((option, index) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.optionItem,
                                    index !== themeOptions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                                    themeType === option.id && { backgroundColor: theme.colors.primary + '10' }
                                ]}
                                onPress={() => setThemeType(option.id)}
                            >
                                <View style={styles.optionLeft}>
                                    <Ionicons name={option.icon as any} size={22} color={themeType === option.id ? theme.colors.primary : theme.colors.foreground} />
                                    <ThemedText style={[styles.optionLabel, themeType === option.id && { color: theme.colors.primary, fontWeight: '600' }]}>
                                        {option.label}
                                    </ThemedText>
                                </View>
                                {themeType === option.id && (
                                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* ✅ EXISTING LOGOUT */}
                    <TouchableOpacity style={[styles.logoutButton, { borderColor: theme.colors.destructive }]} onPress={logout}>
                        <Ionicons name="log-out-outline" size={20} color={theme.colors.destructive} />
                        <ThemedText style={{ color: theme.colors.destructive, marginLeft: 8, fontWeight: '600' }}>Logout</ThemedText>
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },

    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },

    content: {
        padding: 20,
    },

    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },

    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },

    userInfo: { flex: 1 },

    roleBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: 8,
    },

    roleText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },

    extraDetail: {
        marginTop: 4,
        fontSize: 12,
        color: '#666'
    },

    /* ✅ NEW STYLES */
    tabs: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        borderBottomWidth: 1,
        paddingBottom: 10,
    },

    tab: {
        fontSize: 14,
        color: '#777',
        paddingBottom: 5,
    },

    cardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },

    card: {
        width: '48%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
    },

    cardTitle: {
        fontSize: 12,
        color: '#777',
    },

    cardValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 6,
    },

    sectionTitle: {
        marginBottom: 16,
        fontSize: 18,
    },

    settingsCard: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 32,
    },

    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },

    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    optionLabel: {
        marginLeft: 12,
        fontSize: 16,
    },

    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginTop: 20,
    },
});