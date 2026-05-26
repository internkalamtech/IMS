import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../core/theme/ThemeContext'; 
import { getApiBaseUrl } from '../../core/api-config';
import { ThemedView } from '../components/ThemedView'; 
import { ThemedText } from '../components/ThemedText';
import { ThemedCard } from '../components/ThemedCard';

interface StudyMaterial {
    id: string;
    title: string;
    fileType: string;
    fileUrl: string;
    subject?: string;
}

const SUBJECT_COLORS: { [key: string]: string } = {
    Math: '#3498db',      
    Science: '#2ecc71',   
    English: '#e74c3c',   
    History: '#f39c12',   
    PE: '#9b59b6',        
};

export default function StudyMaterialScreen() {
    const { theme } = useTheme();
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        fileType: 'PDF',
        fileUrl: '',
        subject: 'Math',
    });

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${getApiBaseUrl()}/study-materials`);
            if (!response.ok) throw new Error('Backend not reachable');
            const data = await response.json();
            setMaterials(data.materials || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMaterial = async () => {
        if (!formData.title || !formData.fileUrl) {
            Alert.alert('Required', 'Please fill all fields.');
            return;
        }
        try {
            const params = new URLSearchParams({
                title: formData.title,
                file_type: formData.fileType,
                file_url: formData.fileUrl,
                uploaded_by: 'teacher_001',
                subject: formData.subject,
            });
            const response = await fetch(`${getApiBaseUrl()}/study-materials?${params}`, { method: 'POST' });
            if (response.ok) {
                setCreateModalVisible(false);
                fetchMaterials();
                Alert.alert('Success', 'Material added');
            }
        } catch (err) {
            Alert.alert('Error', 'API connection failed');
        }
    };

    if (loading) return <ThemedView style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></ThemedView>;

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerRow}>
                    <View>
                        <ThemedText type="title">Study Materials</ThemedText>
                        <ThemedText style={styles.subtitle}>Teacher Resource Repository</ThemedText>
                    </View>
                    <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.primary }]} onPress={() => setCreateModalVisible(true)}>
                        <Ionicons name="add" size={28} color="white" />
                    </TouchableOpacity>
                </View>

                {error && <ThemedText style={styles.error}>⚠️ {error}</ThemedText>}

                {materials.map((item) => (
                    <ThemedCard key={item.id} style={[styles.card, { borderLeftColor: SUBJECT_COLORS[item.subject || 'Math'], borderLeftWidth: 5 }]}>
                        <View style={styles.cardContent}>
                            <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                            <ThemedText style={styles.subject}>{item.subject}</ThemedText>
                        </View>
                    </ThemedCard>
                ))}
            </ScrollView>
            {/* Modal for adding material would go here */}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    subtitle: { opacity: 0.6, fontSize: 14 },
    addButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    card: { marginBottom: 15, padding: 16, borderRadius: 12 },
    cardContent: { gap: 5 },
    subject: { fontSize: 12, opacity: 0.5 },
    error: { color: 'red', padding: 10 }
});