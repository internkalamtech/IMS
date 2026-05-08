import { useTheme } from '@/core/theme/ThemeContext';
import { ThemedButton } from '@/presentation/components/ThemedButton';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedTextInput } from '@/presentation/components/ThemedTextInput';
import { ThemedView } from '@/presentation/components/ThemedView';

import { IncidentSeverity, IncidentType } from '@/domain/repositories/incident-repository';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ReportIncidentScreenProps {
    onBack: () => void;
    onSubmit: (
        type: IncidentType,
        severity: IncidentSeverity,
        description: string,
        latitude?: number | null,
        longitude?: number | null,
    ) => Promise<boolean>;
    submitting: boolean;
}

const INCIDENT_TYPES: { id: IncidentType; label: string; icon: string; description: string; color: string }[] = [
    { id: 'Breakdown', label: 'Breakdown', icon: 'build', description: 'Vehicle mechanical failure', color: '#f59e0b' },
    { id: 'Accident', label: 'Accident', icon: 'warning', description: 'Collision or crash', color: '#ef4444' },
    { id: 'Delay', label: 'Delay', icon: 'time', description: 'Route delay or hold-up', color: '#3b82f6' },
];

const SEVERITIES: { id: IncidentSeverity; label: string; color: string; bgColor: string; description: string }[] = [
    { id: 'Low', label: 'Low', color: '#10b981', bgColor: '#10b98115', description: 'Minor issue' },
    { id: 'Medium', label: 'Medium', color: '#f59e0b', bgColor: '#f59e0b15', description: 'Moderate concern' },
    { id: 'High', label: 'High', color: '#ef4444', bgColor: '#ef444415', description: 'Urgent situation' },
];

const MAX_DESCRIPTION = 500;

export default function ReportIncidentScreen({ onBack, onSubmit, submitting }: ReportIncidentScreenProps) {
    const { theme } = useTheme();

    const [type, setType] = useState<IncidentType>('Breakdown');
    const [severity, setSeverity] = useState<IncidentSeverity>('Medium');
    const [description, setDescription] = useState('');
    const [locationStatus, setLocationStatus] = useState<'idle' | 'fetching' | 'captured' | 'denied'>('idle');
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

    const selectedType = INCIDENT_TYPES.find(t => t.id === type)!;
    const selectedSeverity = SEVERITIES.find(s => s.id === severity)!;
    const charCount = description.length;
    const isReady = description.trim().length > 0;

    const captureLocation = async () => {
        setLocationStatus('fetching');
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationStatus('denied');
                return;
            }
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
            setLocationStatus('captured');
        } catch {
            setLocationStatus('denied');
        }
    };

    const clearLocation = () => {
        setCoords(null);
        setLocationStatus('idle');
    };

    const handleSubmit = async () => {
        if (!description.trim()) {
            Alert.alert('Missing Description', 'Please describe what happened before submitting.');
            return;
        }

        const result = await onSubmit(
            type,
            severity,
            description.trim(),
            coords?.latitude ?? null,
            coords?.longitude ?? null,
        );

        if (result === true) {
            if (Platform.OS === 'web') {
                alert('Incident reported successfully. Stay safe!');
                onBack();
            } else {
                Alert.alert('Incident Reported ✓', 'Your incident has been logged and the team has been notified.', [
                    { text: 'OK', onPress: onBack },
                ]);
            }
        } else {
            if (Platform.OS === 'web') {
                alert('Failed to report incident. Please try again.');
            } else {
                Alert.alert('Submission Failed', 'Could not submit the report. Please check your connection and try again.');
            }
        }
    };

    const locationBorderColor =
        locationStatus === 'captured'
            ? '#10b981'
            : locationStatus === 'denied'
            ? '#ef4444'
            : theme.colors.border;

    const locationIconName =
        locationStatus === 'captured' ? 'location' : locationStatus === 'denied' ? 'location-sharp' : 'location-outline';

    const locationIconColor =
        locationStatus === 'captured' ? '#10b981' : locationStatus === 'denied' ? '#ef4444' : theme.colors.foreground + '60';

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* ── Header ── */}
                <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton} accessibilityLabel="Go back">
                        <Ionicons name="arrow-back" size={22} color={theme.colors.foreground} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <ThemedText style={styles.headerTitle} type="subtitle">
                            Report Incident
                        </ThemedText>
                        <ThemedText style={styles.headerSubtitle} lightColor="#888" darkColor="#777">
                            Fill in the details below
                        </ThemedText>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                {/* ── Preview pill ── */}
                <View style={[styles.previewPill, { backgroundColor: selectedType.color + '15', borderColor: selectedType.color + '40' }]}>
                    <View style={[styles.previewDot, { backgroundColor: selectedSeverity.color }]} />
                    <ThemedText style={[styles.previewText, { color: selectedType.color }]}>
                        {selectedType.label}
                    </ThemedText>
                    <ThemedText style={[styles.previewSep, { color: selectedType.color + '80' }]}> · </ThemedText>
                    <ThemedText style={[styles.previewText, { color: selectedSeverity.color }]}>
                        {selectedSeverity.label} Severity
                    </ThemedText>
                </View>

                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* ── Incident Type ── */}
                        <View style={styles.section}>
                            <View style={styles.sectionLabelRow}>
                                <View style={[styles.sectionBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                                    <Ionicons name="alert-circle" size={14} color={theme.colors.primary} />
                                </View>
                                <ThemedText style={styles.sectionLabel} type="defaultSemiBold">
                                    Incident Type
                                </ThemedText>
                            </View>
                            <View style={styles.typeGrid}>
                                {INCIDENT_TYPES.map((t) => {
                                    const isSelected = type === t.id;
                                    return (
                                        <TouchableOpacity
                                            key={t.id}
                                            style={[
                                                styles.typeButton,
                                                {
                                                    backgroundColor: isSelected ? t.color + '12' : theme.colors.card,
                                                    borderColor: isSelected ? t.color : theme.colors.border,
                                                    borderWidth: isSelected ? 2 : 1,
                                                },
                                            ]}
                                            onPress={() => setType(t.id)}
                                            accessibilityLabel={`Select ${t.label}`}
                                        >
                                            <View style={[styles.typeIconWrapper, { backgroundColor: isSelected ? t.color + '20' : theme.colors.muted + '60' }]}>
                                                <Ionicons
                                                    name={t.icon as any}
                                                    size={22}
                                                    color={isSelected ? t.color : theme.colors.foreground + '70'}
                                                />
                                            </View>
                                            <ThemedText
                                                style={[
                                                    styles.typeButtonLabel,
                                                    { color: isSelected ? t.color : theme.colors.foreground },
                                                ]}
                                            >
                                                {t.label}
                                            </ThemedText>
                                            <ThemedText
                                                style={styles.typeButtonDesc}
                                                lightColor="#999"
                                                darkColor="#666"
                                                numberOfLines={2}
                                            >
                                                {t.description}
                                            </ThemedText>
                                            {isSelected && (
                                                <View style={[styles.typeCheckmark, { backgroundColor: t.color }]}>
                                                    <Ionicons name="checkmark" size={10} color="#fff" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* ── Severity ── */}
                        <View style={styles.section}>
                            <View style={styles.sectionLabelRow}>
                                <View style={[styles.sectionBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                                    <Ionicons name="speedometer" size={14} color={theme.colors.primary} />
                                </View>
                                <ThemedText style={styles.sectionLabel} type="defaultSemiBold">
                                    Severity Level
                                </ThemedText>
                            </View>
                            <View style={styles.severityRow}>
                                {SEVERITIES.map((s) => {
                                    const isSelected = severity === s.id;
                                    return (
                                        <TouchableOpacity
                                            key={s.id}
                                            style={[
                                                styles.severityButton,
                                                {
                                                    backgroundColor: isSelected ? s.bgColor : theme.colors.card,
                                                    borderColor: isSelected ? s.color : theme.colors.border,
                                                    borderWidth: isSelected ? 2 : 1,
                                                },
                                            ]}
                                            onPress={() => setSeverity(s.id)}
                                            accessibilityLabel={`Select ${s.label} severity`}
                                        >
                                            <View style={[styles.severityDot, { backgroundColor: s.color, shadowColor: s.color }]} />
                                            <View style={{ flex: 1 }}>
                                                <ThemedText
                                                    style={[
                                                        styles.severityLabel,
                                                        { color: isSelected ? s.color : theme.colors.foreground },
                                                    ]}
                                                >
                                                    {s.label}
                                                </ThemedText>
                                                <ThemedText style={styles.severityDesc} lightColor="#999" darkColor="#666">
                                                    {s.description}
                                                </ThemedText>
                                            </View>
                                            {isSelected && (
                                                <Ionicons name="radio-button-on" size={18} color={s.color} />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* ── Description ── */}
                        <View style={styles.section}>
                            <View style={styles.sectionLabelRow}>
                                <View style={[styles.sectionBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                                    <Ionicons name="document-text" size={14} color={theme.colors.primary} />
                                </View>
                                <ThemedText style={styles.sectionLabel} type="defaultSemiBold">
                                    Description
                                </ThemedText>
                                <ThemedText
                                    style={[
                                        styles.charCounter,
                                        { color: charCount > MAX_DESCRIPTION * 0.9 ? '#ef4444' : theme.colors.foreground + '50' },
                                    ]}
                                >
                                    {charCount}/{MAX_DESCRIPTION}
                                </ThemedText>
                            </View>
                            <ThemedTextInput
                                value={description}
                                onChangeText={(t) => setDescription(t.slice(0, MAX_DESCRIPTION))}
                                placeholder="Describe what happened — include location details, vehicle condition, and any safety concerns..."
                                multiline
                                numberOfLines={6}
                                style={[styles.textArea, { minHeight: 130 }]}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* ── GPS Location ── */}
                        <View style={styles.section}>
                            <View style={styles.sectionLabelRow}>
                                <View style={[styles.sectionBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                                    <Ionicons name="navigate" size={14} color={theme.colors.primary} />
                                </View>
                                <ThemedText style={styles.sectionLabel} type="defaultSemiBold">
                                    GPS Location
                                </ThemedText>
                                <ThemedText style={styles.optionalTag} lightColor="#aaa" darkColor="#666">
                                    optional
                                </ThemedText>
                            </View>

                            {locationStatus === 'captured' && coords ? (
                                <View style={[styles.locationCaptured, { backgroundColor: '#10b98112', borderColor: '#10b98140' }]}>
                                    <View style={[styles.locationIconCircle, { backgroundColor: '#10b98120' }]}>
                                        <Ionicons name="location" size={18} color="#10b981" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <ThemedText style={[styles.locationCapturedTitle, { color: '#10b981' }]}>
                                            Location Captured
                                        </ThemedText>
                                        <ThemedText style={styles.locationCoords} lightColor="#555" darkColor="#aaa">
                                            {coords.latitude.toFixed(5)}°N · {coords.longitude.toFixed(5)}°E
                                        </ThemedText>
                                    </View>
                                    <TouchableOpacity onPress={clearLocation} style={styles.clearLocationBtn}>
                                        <Ionicons name="close-circle" size={20} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.locationButton, { backgroundColor: theme.colors.card, borderColor: locationBorderColor }]}
                                    onPress={captureLocation}
                                    disabled={locationStatus === 'fetching' || submitting}
                                    accessibilityLabel="Attach GPS location"
                                >
                                    <View style={[styles.locationIconCircle, {
                                        backgroundColor: locationStatus === 'denied' ? '#ef444415' : theme.colors.primary + '15'
                                    }]}>
                                        <Ionicons name={locationIconName} size={18} color={locationIconColor} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <ThemedText style={[styles.locationButtonText, { color: locationStatus === 'denied' ? '#ef4444' : theme.colors.foreground }]}>
                                            {locationStatus === 'fetching'
                                                ? 'Getting your location…'
                                                : locationStatus === 'denied'
                                                ? 'Location access denied'
                                                : 'Attach GPS Location'}
                                        </ThemedText>
                                        <ThemedText style={styles.locationButtonSub} lightColor="#aaa" darkColor="#666">
                                            {locationStatus === 'denied'
                                                ? 'Enable location in Settings to attach coordinates'
                                                : 'Helps responders find you faster'}
                                        </ThemedText>
                                    </View>
                                    {locationStatus !== 'fetching' && locationStatus !== 'denied' && (
                                        <Ionicons name="chevron-forward" size={16} color={theme.colors.foreground + '40'} />
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={{ height: 20 }} />
                    </ScrollView>

                    {/* ── Footer ── */}
                    <View style={[styles.footer, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
                        {!isReady && (
                            <View style={[styles.footerHint, { backgroundColor: theme.colors.muted + '60' }]}>
                                <Ionicons name="information-circle-outline" size={14} color={theme.colors.foreground + '60'} />
                                <ThemedText style={styles.footerHintText} lightColor="#999" darkColor="#666">
                                    Add a description to submit
                                </ThemedText>
                            </View>
                        )}
                        <ThemedButton
                            title={submitting ? 'Submitting Report…' : 'Submit Incident Report'}
                            onPress={handleSubmit}
                            disabled={submitting || !isReady}
                            style={styles.submitButton}
                        />
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22,
    },
    headerCenter: { alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '700' },
    headerSubtitle: { fontSize: 12, marginTop: 1 },

    // Preview pill
    previewPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        marginVertical: 12,
    },
    previewDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        marginRight: 7,
    },
    previewText: { fontSize: 13, fontWeight: '600' },
    previewSep: { fontSize: 13 },

    // Scroll
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24 },

    // Sections
    section: { marginBottom: 28 },
    sectionLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        gap: 8,
    },
    sectionBadge: {
        width: 26,
        height: 26,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionLabel: { fontSize: 15, flex: 1 },
    charCounter: { fontSize: 12, fontWeight: '500' },
    optionalTag: { fontSize: 12 },

    // Type cards
    typeGrid: { flexDirection: 'row', gap: 10 },
    typeButton: {
        flex: 1,
        borderRadius: 18,
        paddingVertical: 16,
        paddingHorizontal: 10,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    typeIconWrapper: {
        width: 46,
        height: 46,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    typeButtonLabel: { fontSize: 13, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
    typeButtonDesc: { fontSize: 11, textAlign: 'center', lineHeight: 15 },
    typeCheckmark: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Severity
    severityRow: { gap: 10 },
    severityButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 12,
    },
    severityDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 2,
    },
    severityLabel: { fontSize: 14, fontWeight: '700' },
    severityDesc: { fontSize: 12, marginTop: 1 },

    // Description
    textArea: { borderRadius: 16, paddingTop: 14 },

    // Location
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 14,
        gap: 12,
    },
    locationCaptured: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 14,
        gap: 12,
    },
    locationIconCircle: {
        width: 38,
        height: 38,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationButtonText: { fontSize: 14, fontWeight: '600' },
    locationButtonSub: { fontSize: 12, marginTop: 2 },
    locationCapturedTitle: { fontSize: 14, fontWeight: '700' },
    locationCoords: { fontSize: 12, marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    clearLocationBtn: { padding: 4 },

    // Footer
    footer: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 8 : 20,
        borderTopWidth: StyleSheet.hairlineWidth,
        gap: 10,
    },
    footerHint: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 6,
    },
    footerHintText: { fontSize: 12 },
    submitButton: { borderRadius: 16, height: 54 },
});
