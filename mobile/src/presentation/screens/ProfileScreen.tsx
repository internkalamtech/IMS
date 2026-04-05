import { useTheme } from '@/core/theme/ThemeContext';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TABS = ['Overview', 'Exams', 'Attendance', 'Conduct'];

export default function StudentProfileScreen() {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('Overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'Overview':
                return (
                    <View style={styles.cardRow}>
                        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <Ionicons name="trophy-outline" size={22} color={theme.colors.primary} />
                            <ThemedText style={styles.cardValue}>12</ThemedText>
                            <ThemedText style={styles.cardLabel}>Current Rank</ThemedText>
                        </View>

                        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <Ionicons name="checkmark-done-outline" size={22} color={theme.colors.primary} />
                            <ThemedText style={styles.cardValue}>92%</ThemedText>
                            <ThemedText style={styles.cardLabel}>Attendance</ThemedText>
                        </View>
                    </View>
                );

            default:
                return (
                    <ThemedText style={{ textAlign: 'center', marginTop: 20 }}>
                        {activeTab} data coming soon
                    </ThemedText>
                );
        }
    };

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                
                {/* HEADER */}
                <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                    <ThemedText type="title">Student Profile</ThemedText>
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    {/* PROFILE CARD */}
                    <View style={styles.profileCard}>
                        <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
                            <ThemedText style={{ color: theme.colors.primary, fontSize: 28, fontWeight: '700' }}>
                                J
                            </ThemedText>
                        </View>

                        <View style={styles.profileInfo}>
                            <ThemedText type="subtitle">Mahi Fareeha</ThemedText>
                            <ThemedText lightColor="#666">Roll No: 23CS101</ThemedText>
                            <ThemedText lightColor="#666">Parent: +91 9876543210</ThemedText>
                             <ThemedText lightColor="#666">Email:mahifareeha123@gmail.com</ThemedText>
                        </View>
                    </View>

                    {/* TABS */}
                    <View style={[styles.tabsContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        {TABS.map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[
                                    styles.tab,
                                    activeTab === tab && { backgroundColor: theme.colors.primary + '20' }
                                ]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <ThemedText
                                    style={[
                                        styles.tabText,
                                        activeTab === tab && { color: theme.colors.primary, fontWeight: '600' }
                                    ]}
                                >
                                    {tab}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* CONTENT */}
                    <View style={styles.section}>
                        {renderContent()}
                    </View>

                </ScrollView>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    content: {
        padding: 20,
    },

    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
    },

    tabsContainer: {
        flexDirection: 'row',
        borderRadius: 16,
        borderWidth: 1,
        padding: 6,
        marginBottom: 20,
        justifyContent: 'space-between',
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 12,
    },
    tabText: {
        fontSize: 14,
    },

    section: {
        marginTop: 10,
    },

    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    card: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cardValue: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 8,
    },
    cardLabel: {
        fontSize: 12,
        marginTop: 4,
        opacity: 0.7,
    },
});