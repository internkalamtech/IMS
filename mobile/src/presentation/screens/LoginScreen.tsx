import { useAuth } from '@/presentation/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error, demoCredentials } = useAuth();

    const handleLogin = () => {
        login(email, password);
    };


    const autofill = (userEmail: string, userPass: string) => {
        setEmail(userEmail);
        setPassword(userPass);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="school" size={40} color="#0066FF" />
                        </View>
                        <Text style={styles.headerTitle}>KalamTech</Text>
                        <Text style={styles.headerSubtitle}>Smart Institute Management System</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Welcome Back</Text>

                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                editable={!loading}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>Login</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <View style={styles.demoBox}>
                            <Text style={styles.demoTitle}>Demo Credentials (Server-side):</Text>
                            {demoCredentials.map((cred, index) => (
                                <View key={index}>
                                    {cred.description && (index === 0 || demoCredentials[index - 1].description !== cred.description) ? (
                                        <Text style={styles.demoSectionTitle}>{cred.description}:</Text>
                                    ) : null}
                                    <View style={styles.demoRow}>
                                        <View style={styles.demoUserIcon}>
                                            <Ionicons name={cred.icon as any} size={16} color="#555" />
                                        </View>
                                        <Text style={styles.demoText}>
                                            {cred.email} / {cred.password}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => autofill(cred.email, cred.password)}
                                            style={styles.autofillButton}
                                        >
                                            <Ionicons name="log-in-outline" size={20} color="#0066FF" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0066FF',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 40,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#fff',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 24,
    },
    errorContainer: {
        backgroundColor: '#FFE5E5',
        padding: 12,
        borderRadius: 10,
        marginBottom: 16,
    },
    errorText: {
        color: '#D8000C',
        fontSize: 14,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F5F7FA',
        borderRadius: 12,
        height: 50,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#E1E5EA',
    },
    loginButton: {
        backgroundColor: '#0066FF',
        borderRadius: 12,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#0066FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    forgotPassword: {
        alignItems: 'center',
        marginTop: 16,
    },
    forgotPasswordText: {
        color: '#0066FF',
        fontSize: 14,
    },
    demoBox: {
        marginTop: 24,
        backgroundColor: '#F0F7FF',
        borderRadius: 16,
        padding: 16,
    },
    demoTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 8,
    },
    demoSectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#777',
        marginTop: 8,
        marginBottom: 4,
    },
    demoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    demoUserIcon: {
        marginRight: 8,
    },
    demoText: {
        fontSize: 12,
        color: '#666',
        flex: 1,
    },
    autofillButton: {
        padding: 4,
        marginLeft: 8,
    },
});

