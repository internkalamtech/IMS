import { useAuth } from '@/presentation/hooks/useAuth';
import { useDashboard } from '@/presentation/hooks/useDashboard';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const { data, loading, error, refresh } = useDashboard();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.userName}>{user?.name}</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
            </View>

            <View style={styles.roleBadge}>
                <Ionicons name="shield-checkmark" size={16} color="#fff" />
                <Text style={styles.roleText}>{data?.role || 'Branch Admin'}</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <ActivityIndicator animating={loading} />
                }
            >
                <Text style={styles.sectionTitle}>Overview (From Server)</Text>

                {loading && !data ? (
                    <ActivityIndicator size="large" color="#0066FF" style={{ marginTop: 40 }} />
                ) : error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : (
                    <View style={styles.statsContainer}>
                        {data?.stats.map((stat, index) => (
                            <View key={index} style={[styles.statCard, { backgroundColor: index % 2 === 0 ? '#E1F5FE' : '#FFF9C4' }]}>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Intern Note:</Text>
                    <Text style={styles.infoText}>
                        This dashboard demonstrates how to fetch data from a server repository using a Use Case and a Domain Entity.
                    </Text>
                    <Text style={styles.infoText}>
                        The "Quick Actions" and other functional modules should be implemented by following this pattern.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    welcomeText: {
        fontSize: 16,
        color: '#666',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    logoutButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0066FF',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 20,
        marginLeft: 20,
    },
    roleText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        width: '48%',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    errorText: {
        color: '#FF3B30',
        textAlign: 'center',
        marginTop: 20,
    },
    infoBox: {
        backgroundColor: '#F0F4FF',
        padding: 20,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#0066FF',
        marginTop: 20,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0044AA',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#445577',
        lineHeight: 20,
        marginBottom: 8,
    },
});

