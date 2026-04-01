import React from "react";
import { View, FlatList, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { ThemedText } from "@/presentation/components/ThemedText";
import { ThemedView } from "@/presentation/components/ThemedView";
import { useTheme } from "@/core/theme/ThemeContext";

// Data from your dashboard screenshot
const studyMaterials = [
  { id: 1, title: 'Algebra Worksheet', subject: 'Mathematics', type: 'PDF', color: '#3b82f6' },
  { id: 2, title: 'Chemical Reactions', subject: 'Science', type: 'PPT', color: '#10b981' },
  { id: 3, title: 'Quantum Physics', subject: 'Physics', type: 'Link', color: '#a855f7' },
];

export default function StudyMaterialScreen() {
  const { theme } = useTheme();

  const renderItem = ({ item }: any) => (
    <ThemedView style={[styles.card, { borderLeftColor: item.color }]}>
      <View style={styles.cardContent}>
        <ThemedText type="subtitle" style={{ fontWeight: '700' }}>{item.title}</ThemedText>
        <ThemedText style={styles.metadata}>
          {item.subject} • {item.type}
        </ThemedText>
      </View>
      <TouchableOpacity style={styles.deleteBtn}>
           <ThemedText style={{color: '#FF4D4D', fontWeight: 'bold'}}>DELETE</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Study Materials</ThemedText>
        <ThemedText style={{ opacity: 0.6 }}>Manage academic resources</ThemedText>
      </ThemedView>
      
      <FlatList
        data={studyMaterials}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20 }}
      />

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.colors.primary }]} 
        onPress={() => alert("Upload Form Opening...")}
      >
        <ThemedText style={styles.fabText}>+</ThemedText>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 10 },
  card: {
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 8,
    backgroundColor: '#FFFFFF',
    // Shadow for clean card look
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  cardContent: { flex: 1 },
  metadata: { fontSize: 13, opacity: 0.6, marginTop: 4 },
  deleteBtn: { padding: 5 },
  fab: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },
  fabText: { color: 'white', fontSize: 35, fontWeight: '300' }
});