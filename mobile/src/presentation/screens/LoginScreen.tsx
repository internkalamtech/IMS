import { useTheme } from '@/core/theme/ThemeContext';
import { useAuth } from '@/presentation/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedButton } from '../components/ThemedButton';
import { ThemedCard } from '../components/ThemedCard';
import { ThemedText } from '../components/ThemedText';
import { ThemedTextInput } from '../components/ThemedTextInput';
import { ThemedView } from '../components/ThemedView';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error, demoCredentials } = useAuth();
    const { theme } = useTheme();

    const handleLogin = async () => {
        try {
            await login(email, password);
        } catch {
            // Error state is managed in AuthContext.
        }
    };

    const autofill = (userEmail: string, userPass: string) => {
        setEmail(userEmail);
        setPassword(userPass);
    };

    return (
        <ThemedView style={styles.container} lightColor="#0066FF" darkColor={theme.colors.background}>
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.header}>
                            <View style={[styles.logoContainer, { backgroundColor: theme.colors.background, shadowColor: theme.colors.primary }]}>
                                <Ionicons name="school" size={40} color={theme.colors.primary} />
                            </View>
                            <ThemedText style={styles.headerTitle} lightColor="#fff">KalamTech</ThemedText>
                            <ThemedText style={styles.headerSubtitle} lightColor="rgba(255, 255, 255, 0.8)">Smart Institute Management System</ThemedText>
                        </View>

                        <ThemedCard style={styles.card}>
                            <ThemedText type="title" style={styles.cardTitle}>Welcome Back</ThemedText>

                            {error && (
                                <View style={[styles.errorContainer, { backgroundColor: theme.colors.destructive }]}>
                                    <ThemedText style={styles.errorText} lightColor="#fff" darkColor="#fff">{error}</ThemedText>
                                </View>
                            )}

                            <ThemedTextInput
                                label="Email"
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                editable={!loading}
                            />

                            <ThemedTextInput
                                label="Password"
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                editable={!loading}
                            />

                            <ThemedButton
                                title={loading ? 'Logging in...' : 'Login'}
                                onPress={handleLogin}
                                disabled={loading}
                                style={{ marginTop: 8 }}
                            />

                            <Pressable style={styles.forgotPassword}>
                                <ThemedText type="link">Forgot Password?</ThemedText>
                            </Pressable>

                            <View style={[styles.demoBox, { backgroundColor: theme.colors.secondary }]}>
                                <ThemedText style={styles.demoTitle}>Demo Credentials (Server-side):</ThemedText>
                                {demoCredentials.map((cred, index) => (
                                    <View key={index}>
                                        {cred.description && (index === 0 || demoCredentials[index - 1].description !== cred.description) ? (
                                            <ThemedText style={styles.demoSectionTitle}>{cred.description}:</ThemedText>
                                        ) : null}
                                        <View style={styles.demoRow}>
                                            <View style={styles.demoUserIcon}>
                                                <Ionicons name={cred.icon as any} size={16} color={theme.colors.mutedForeground} />
                                            </View>
                                            <ThemedText style={styles.demoText}>
                                                {cred.email} / {cred.password}
                                            </ThemedText>
                                            <Pressable
                                                onPress={() => autofill(cred.email, cred.password)}
                                                style={styles.autofillButton}
                                            >
                                                <Ionicons name="log-in-outline" size={20} color={theme.colors.primary} />
                                            </Pressable>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </ThemedCard>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ThemedView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    card: {
        borderRadius: 30,
        padding: 24,
    },
    cardTitle: {
        textAlign: 'center',
        marginBottom: 24,
    },
    errorContainer: {
        padding: 12,
        borderRadius: 10,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 14,
        textAlign: 'center',
    },
    forgotPassword: {
        alignItems: 'center',
        marginTop: 16,
    },
    demoBox: {
        marginTop: 24,
        borderRadius: 16,
        padding: 16,
    },
    demoTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    demoSectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
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
        flex: 1,
    },
    autofillButton: {
        padding: 4,
        marginLeft: 8,
    },
});
