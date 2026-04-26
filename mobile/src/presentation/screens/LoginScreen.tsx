/**
 * LoginScreen — fixed to use hardcoded light colours (matching the blue UI design)
 * instead of theme-aware components that go dark when the device is in dark mode.
 */

import { useAuth } from '@/presentation/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BLUE = '#0066FF';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, loading, error, demoCredentials } = useAuth();

    const handleLogin = () => login(email, password);

    const autofill = (userEmail: string, userPass: string) => {
        setEmail(userEmail);
        setPassword(userPass);
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

                    {/* ── Blue header ── */}
                    <View style={styles.header}>
                        <View style={styles.logoBox}>
                            <Ionicons name="school" size={36} color={BLUE} />
                        </View>
                        <Text style={styles.appName}>KalamTech</Text>
                        <Text style={styles.appSub}>Smart Institute Management System</Text>
                    </View>

                    {/* ── White login card ── */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Welcome Back</Text>
                        <Text style={styles.cardSub}>Sign in to continue</Text>

                        {error ? (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle-outline" size={16} color="#DC2626" style={{ marginRight: 6 }} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        {/* Email */}
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="mail-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="#94A3B8"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                editable={!loading}
                            />
                        </View>

                        {/* Password */}
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Enter your password"
                                placeholderTextColor="#94A3B8"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                editable={!loading}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={{ padding: 4 }}>
                                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        <Pressable style={styles.forgotRow}>
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </Pressable>

                        {/* Login button */}
                        <TouchableOpacity
                            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={styles.loginBtnText}>Login</Text>
                            }
                        </TouchableOpacity>

                        {/* Demo credentials */}
                        <View style={styles.demoBox}>
                            <Text style={styles.demoTitle}>Demo Credentials</Text>
                            {demoCredentials.map((cred, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.demoRow}
                                    onPress={() => autofill(cred.email, cred.password)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.demoIconWrap}>
                                        <Ionicons name={cred.icon as any} size={14} color={BLUE} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        {cred.description && (index === 0 || demoCredentials[index - 1].description !== cred.description) ? (
                                            <Text style={styles.demoRole}>{cred.description}</Text>
                                        ) : null}
                                        <Text style={styles.demoCredText}>
                                            {cred.email} / {cred.password}
                                        </Text>
                                    </View>
                                    <Ionicons name="log-in-outline" size={18} color={BLUE} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: BLUE,
    },
    scroll: {
        flexGrow: 1,
    },

    // ── Header (blue section) ──────────────────────────────────────────────────
    header: {
        backgroundColor: BLUE,
        alignItems: 'center',
        paddingTop: 36,
        paddingBottom: 48,
        paddingHorizontal: 24,
    },
    logoBox: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    appName: {
        fontSize: 30,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    appSub: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
    },

    // ── White card (rounded top) ───────────────────────────────────────────────
    card: {
        flex: 1,
        backgroundColor: '#F0F4F8',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 28,
        paddingBottom: 48,
        marginTop: -20,      // overlap the blue header slightly
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    cardSub: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 28,
    },

    // ── Error ─────────────────────────────────────────────────────────────────
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        color: '#DC2626',
        fontSize: 13,
        flex: 1,
    },

    // ── Inputs ────────────────────────────────────────────────────────────────
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 15,
        color: '#111827',
    },

    forgotRow: {
        alignItems: 'flex-end',
        marginTop: -8,
        marginBottom: 20,
    },
    forgotText: {
        fontSize: 13,
        color: BLUE,
        fontWeight: '600',
    },

    // ── Login button ──────────────────────────────────────────────────────────
    loginBtn: {
        backgroundColor: BLUE,
        borderRadius: 16,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 5,
    },
    loginBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    // ── Demo credentials ──────────────────────────────────────────────────────
    demoBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    demoTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 10,
    },
    demoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        gap: 10,
    },
    demoIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    demoRole: {
        fontSize: 10,
        fontWeight: '700',
        color: BLUE,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 1,
    },
    demoCredText: {
        fontSize: 12,
        color: '#374151',
    },
});
