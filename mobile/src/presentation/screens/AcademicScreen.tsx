import { useTheme } from '@/core/theme/ThemeContext';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AcademicRepository, AcademicSummaryResponse } from '@/data/repositories/academic-repository-impl';

const { width } = Dimensions.get('window');
interface HomeworkItem {
    id: string;
    subject: string;
    title: string;
    description: string;
    teacher: string;
    dueDate: string;
    status: 'pending' | 'submitted' | 'overdue';
    subjectColor: string;
}

// Remove mock HOMEWORK_DATA. Homework list logic will be added when backend is ready.

const STUDY_MATERIALS: { id: string; subject: string; title: string; type: string; size: string; subjectColor: string }[] = [
    { id: '1', subject: 'Mathematics', title: 'Chapter 4 – Algebra Notes', type: 'PDF', size: '2.4 MB', subjectColor: '#6366f1' },
    { id: '2', subject: 'Science', title: 'Solar System Diagrams', type: 'Images', size: '5.1 MB', subjectColor: '#10b981' },
    { id: '3', subject: 'English', title: 'Essay Writing Guide', type: 'PDF', size: '1.2 MB', subjectColor: '#f59e0b' },
    { id: '4', subject: 'Hindi', title: 'Grammar Reference Sheet', type: 'PDF', size: '0.8 MB', subjectColor: '#ec4899' },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: '#fef3c715', text: '#f59e0b', label: 'Pending' },
    submitted: { bg: '#d1fae515', text: '#10b981', label: 'Submitted' },
    overdue: { bg: '#fee2e215', text: '#ef4444', label: 'Overdue' },
};

export default function AcademicsScreen() {
    const router = useRouter();
    const { initialTab } = useLocalSearchParams<{ initialTab?: string }>();
    const { theme } = useTheme();
    const { childId } = useLocalSearchParams<{ childId?: string }>();
    const tabs = ['Homework', 'Study Materials'];
    const [activeTab, setActiveTab] = useState(
        initialTab === 'homework' ? 0 : 0
    );
    const indicatorAnim = useRef(new Animated.Value(activeTab)).current;

    // Academic summary state
    const [summary, setSummary] = useState<AcademicSummaryResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (initialTab === 'homework') {
            setActiveTab(0);
        }
    }, [initialTab]);

    useEffect(() => {
        if (!childId) return; //Optionally handle missing childId
        AcademicRepository.getAcademicSummary(childId)
            .then(data => setSummary(data))
            .catch(err => setSummary(null))
            .finally(() => setLoading(false));
    }, [childId]);

    const handleTabChange = (index: number) => {
        setActiveTab(index);
        Animated.spring(indicatorAnim, {
            toValue: index,
            useNativeDriver: false,
            tension: 120,
            friction: 10,
        }).start();
    };

    // Use summary?.pending_homework_count for badge and summary pill
    const pendingCount = summary?.pending_homework_count ?? 0;

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.headerTitle}>
                            <ThemedText
                                style={styles.headerTitleText}
                                lightColor={theme.colors.primaryForeground}
                                darkColor={theme.colors.primaryForeground}
                            >
                            Academics
                            </ThemedText>

                            <ThemedText
                                style={styles.headerSubtitle}
                                lightColor={theme.colors.primaryForeground}
                                darkColor={theme.colors.primaryForeground}
                            >
                            Aarav Kumar · Class 7-B
                            </ThemedText>
                        </View>
                        <View style={styles.headerBadge}>
                            <ThemedText style={styles.headerBadgeText}>
                                {loading ? '...' : pendingCount}
                            </ThemedText>
                        </View>
                    </View>

                    {/* Tab Bar */}
                    <View style={styles.tabBar}>
                        {tabs.map((tab, index) => (
                            <TouchableOpacity
                                key={tab}
                                style={styles.tab}
                                onPress={() => handleTabChange(index)}
                                activeOpacity={0.8}
                            >
                                <ThemedText
                                    style={[
                                        styles.tabText,
                                        { color: activeTab === index ? '#fff' : 'rgba(255,255,255,0.55)' },
                                    ]}
                                >
                                    {tab}
                                </ThemedText>
                                {activeTab === index && (
                                    <View style={styles.tabIndicator} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </SafeAreaView>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {activeTab === 0 ? (
                    // Homework Tab
                    <View>
                        {/* Summary row */}
                        <View style={styles.summaryRow}>
                            <SummaryPill
                                label="Pending"
                                count={loading ? 0 : pendingCount}
                                color="#f59e0b"
                                theme={theme}
                            />
                            {/* You can add more pills for Overdue/Submitted when backend supports it */}
                        </View>

                        {/* Render homework list here when backend provides it */}
                    </View>
                ) : (
                    // Study Materials Tab
                    <View>
                        {STUDY_MATERIALS.map(item => (
                            <View
                                key={item.id}
                                style={[styles.materialCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                            >
                                <View style={[styles.materialIcon, { backgroundColor: item.subjectColor + '20' }]}>
                                    <Ionicons name="document-text" size={22} color={item.subjectColor} />
                                </View>
                                <View style={styles.materialContent}>
                                    <View style={[styles.subjectPill, { backgroundColor: item.subjectColor + '20' }]}>
                                        <ThemedText style={[styles.subjectPillText, { color: item.subjectColor }]}>
                                            {item.subject}
                                        </ThemedText>
                                    </View>
                                    <ThemedText style={styles.materialTitle} type="defaultSemiBold">
                                        {item.title}
                                    </ThemedText>
                                    <ThemedText style={styles.materialMeta} lightColor="#888" darkColor="#aaa">
                                        {item.type} · {item.size}
                                    </ThemedText>
                                </View>
                                <TouchableOpacity style={[styles.downloadButton, { backgroundColor: theme.colors.primary + '15' }]}>
                                    <Ionicons name="download-outline" size={20} color={theme.colors.primary} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </ThemedView>
    );
}

function SummaryPill({ label, count, color, theme }: { label: string; count: number; color: string; theme: any }) {
    return (
        <View style={[styles.summaryPill, { backgroundColor: color + '15', borderColor: color + '30' }]}>
            <ThemedText style={[styles.summaryPillCount, { color }]}>{count}</ThemedText>
            <ThemedText style={[styles.summaryPillLabel, { color }]}>{label}</ThemedText>
        </View>
    );
}

function HomeworkCard({ item, theme }: { item: HomeworkItem; theme: any }) {
    const statusStyle = STATUS_STYLES[item.status];
    return (
        <View style={[styles.hwCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.hwCardTop}>
                <View style={[styles.subjectPill, { backgroundColor: item.subjectColor + '20' }]}>
                    <ThemedText style={[styles.subjectPillText, { color: item.subjectColor }]}>
                        {item.subject}
                    </ThemedText>
                </View>
                <ThemedText style={styles.dueDate} lightColor="#888" darkColor="#aaa">
                    Due: {item.dueDate}
                </ThemedText>
            </View>
            <ThemedText style={styles.hwTitle} type="defaultSemiBold">
                {item.title}
            </ThemedText>
            <ThemedText style={styles.hwDesc} lightColor="#666" darkColor="#999">
                {item.description}
            </ThemedText>
            <View style={styles.hwCardBottom}>
                <ThemedText style={styles.hwTeacher} lightColor="#888" darkColor="#aaa">
                    Teacher: {item.teacher}
                </ThemedText>
                <View style={[styles.statusPill, { backgroundColor: statusStyle.bg, borderColor: statusStyle.text + '30' }]}>
                    <ThemedText style={[styles.statusPillText, { color: statusStyle.text }]}>
                        {statusStyle.label}
                    </ThemedText>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingBottom: 0 },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        gap: 12,
    },
    backButton: { padding: 4 },
    headerTitle: { flex: 1 },
    headerTitleText: { fontSize: 20, fontWeight: '700' },
    headerSubtitle: { fontSize: 13, marginTop: 2, opacity: 0.8 },
    headerBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerBadgeText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    tabBar: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 0,
        gap: 8,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        position: 'relative',
    },
    tabText: { fontSize: 14, fontWeight: '600' },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 16,
        right: 16,
        height: 3,
        backgroundColor: '#fff',
        borderRadius: 2,
    },
    scrollView: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    summaryRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    summaryPill: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        gap: 2,
    },
    summaryPillCount: { fontSize: 22, fontWeight: '800' },
    summaryPillLabel: { fontSize: 11, fontWeight: '600' },
    hwCard: {
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        gap: 6,
    },
    hwCardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    hwTitle: { fontSize: 15 },
    hwDesc: { fontSize: 13, lineHeight: 18 },
    hwCardBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    hwTeacher: { fontSize: 12 },
    subjectPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    subjectPillText: { fontSize: 12, fontWeight: '600' },
    statusPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
    },
    statusPillText: { fontSize: 11, fontWeight: '700' },
    dueDate: { fontSize: 12 },
    materialCard: {
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    materialIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    materialContent: { flex: 1, gap: 4 },
    materialTitle: { fontSize: 14 },
    materialMeta: { fontSize: 12 },
    downloadButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
