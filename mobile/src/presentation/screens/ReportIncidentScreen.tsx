import { useTheme } from '@/core/theme/ThemeContext';
import { ThemedButton } from '@/presentation/components/ThemedButton';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedTextInput } from '@/presentation/components/ThemedTextInput';
import { ThemedView } from '@/presentation/components/ThemedView';

import { IncidentSeverity, IncidentType } from '@/domain/repositories/incident-repository';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ReportIncidentScreenProps {
    onBack: () => void;
    onSubmit: (type: IncidentType, severity: IncidentSeverity, description: string) => Promise<boolean>;
    submitting: boolean;
}

const INCIDENT_TYPES: { id: IncidentType; label: string; icon: string }[] = [
    { id: 'Breakdown', label: 'Breakdown', icon: 'build' },
    { id: 'Accident', label: 'Accident', icon: 'warning' },
    { id: 'Delay', label: 'Delay', icon: 'time' },
];

const SEVERITIES: { id: IncidentSeverity; label: string; color: string }[] = [
    { id: 'Low', label: 'Low', color: '#10b981' },
    { id: 'Medium', label: 'Medium', color: '#f59e0b' },
    { id: 'High', label: 'High', color: '#ef4444' },
];

export default function ReportIncidentScreen({ onBack, onSubmit, submitting }: ReportIncidentScreenProps) {
    const { theme } = useTheme();

    const [type, setType] = useState<IncidentType>('Breakdown');
    const [severity, setSeverity] = useState<IncidentSeverity>('Medium');
    const [description, setDescription] = useState('');

    const handleSubmit = async () => {
        if (!description.trim()) {
            Alert.alert('Error', 'Please provide a description of the incident.');
            return;
        }

        const success = await onSubmit(type, severity, description.trim());
        
        if (success) {
            if (Platform.OS === 'web') {
                alert('Your incident has been successfully logged.');
                onBack();
            } else {
                Alert.alert(
                    'Incident Reported',
                    'Your incident has been successfully logged.',
                    [{ text: 'OK', onPress: onBack }]
                );
            }
        } else {
            if (Platform.OS === 'web') {
                alert('Failed to report incident. Please try again.');
            } else {
                Alert.alert('Error', 'Failed to report incident. Please try again.');
            }
        }
    };

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.foreground} />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle} type="subtitle">Report Incident</ThemedText>
                    <View style={{ width: 40 }} /> {/* Placeholder for balance */}
                </View>

                <KeyboardAvoidingView 
                    style={{ flex: 1 }} 
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                        
                        {/* Incident Type */}
                        <View style={styles.section}>
                            <ThemedText style={styles.sectionLabel} type="defaultSemiBold">Incident Type</ThemedText>
                            <View style={styles.typeGrid}>
                                {INCIDENT_TYPES.map((t) => (
                                    <TouchableOpacity
                                        key={t.id}
                                        style={[
                                            styles.typeButton,
                                            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                                            type === t.id && { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary }
                                        ]}
                                        onPress={() => setType(t.id)}
                                    >
                                        <Ionicons 
                                            name={t.icon as any} 
                                            size={24} 
                                            color={type === t.id ? theme.colors.primary : theme.colors.foreground + '80'} 
                                            style={{ marginBottom: 8 }}
                                        />
                                        <ThemedText 
                                            style={[styles.typeButtonText, type === t.id && { color: theme.colors.primary, fontWeight: '700' }]}
                                        >
                                            {t.label}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Severity */}
                        <View style={styles.section}>
                            <ThemedText style={styles.sectionLabel} type="defaultSemiBold">Severity</ThemedText>
                            <View style={styles.severityContainer}>
                                {SEVERITIES.map((s) => (
                                    <TouchableOpacity
                                        key={s.id}
                                        style={[
                                            styles.severityButton,
                                            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                                            severity === s.id && { backgroundColor: s.color + '15', borderColor: s.color }
                                        ]}
                                        onPress={() => setSeverity(s.id)}
                                    >
                                        <View style={[styles.severityDot, { backgroundColor: s.color }]} />
                                        <ThemedText 
                                            style={[styles.severityButtonText, severity === s.id && { color: s.color, fontWeight: '700' }]}
                                        >
                                            {s.label}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Description */}
                        <View style={styles.section}>
                            <ThemedText style={styles.sectionLabel} type="defaultSemiBold">Description</ThemedText>
                            <ThemedTextInput
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Provide details about the incident..."
                                multiline
                                numberOfLines={6}
                                style={[styles.textArea, { minHeight: 120 }]}
                                textAlignVertical="top"
                            />
                        </View>

                    </ScrollView>

                    {/* Footer / Submit Button */}
                    <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
                        <ThemedButton 
                            title={submitting ? "Submitting..." : "Submit Report"} 
                            onPress={handleSubmit} 
                            disabled={submitting} 
                            style={styles.submitButton}
                        />
                    </View>
                </KeyboardAvoidingView>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    backButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 18,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionLabel: {
        marginBottom: 16,
        fontSize: 16,
    },
    typeGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    typeButton: {
        flex: 1,
        borderWidth: 2,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    typeButtonText: {
        fontSize: 13,
        fontWeight: '500',
    },
    severityContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    severityButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderRadius: 12,
        paddingVertical: 12,
    },
    severityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    severityButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    textArea: {
        borderRadius: 16,
        paddingTop: 16,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
    },
    submitButton: {
        borderRadius: 16,
        height: 56,
    }
});
