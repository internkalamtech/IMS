import React from "react";
import { ScrollView,StyleSheet } from "react-native";
import { ThemedView } from "@/presentation/components/ThemedView";
import { ThemedText } from "@/presentation/components/ThemedText";
interface Update {
    id: string;
    title: string;
    description: string;
    time: string;
}

export const RecentUpdates = () => {
    // 2 dummy updates
    const updates: Update[] = [
        {
            id: '1',
            title: 'New Assignment Uploaded',
            description: 'Your math assignment has been uploaded by Miss Jennie.',
            time: '2 hours ago',
        },
        {
            id: '2',
            title: 'Exam Schedule Released',
            description: 'Check your upcoming exams for this semester.',
            time: '1 day ago',
        },
    ];

    return (
        <ThemedView style={styles.container}>
            {/* Section title outside the cards */}
            <ThemedText style={styles.heading}>Recent Updates</ThemedText>

            {/* Scrollable area for all update cards */}
            <ScrollView showsVerticalScrollIndicator={false}>
                {updates.map((item) => (
                    <ThemedView key={item.id} style={styles.card}>
                        <ThemedText style={styles.title}>{item.title}</ThemedText>
                        <ThemedText style={styles.description}>{item.description}</ThemedText>
                        <ThemedText style={styles.time}>{item.time}</ThemedText>
                    </ThemedView>
                ))}
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop:-10,
        paddingHorizontal: 16,
        flex: 1,
        paddingTop:20,
        backgroundColor: '#f5f5f5',
    },
    heading: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    card: {
        backgroundColor: '#fdfdfd',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#555',
    },
    time: {
        fontSize: 12,
        color: '#999',
        marginTop: 6,
    },
});