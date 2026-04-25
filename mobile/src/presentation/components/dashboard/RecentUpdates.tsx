import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface Update {
    id: string;
    title: string;
    description: string;
    time: string;
}

export const RecentUpdates = ({ updates = [] }: { updates?: Update[] }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Recent Updates</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
                {updates.map((item) => (
                    <View key={item.id} style={styles.card}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.description}>{item.description}</Text>
                        <Text style={styles.time}>{item.time}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 20,
        backgroundColor: "#f5f5f5",
    },
    heading: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 10,
    },
    card: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    title: { fontSize: 16, fontWeight: "500" },
    description: { fontSize: 14, color: "#555" },
    time: { fontSize: 12, color: "#999", marginTop: 6 },
});