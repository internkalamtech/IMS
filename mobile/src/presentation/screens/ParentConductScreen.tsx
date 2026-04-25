/**
 * Parent Portal - Conduct/Discipline Record
 * PHASE 4, EPIC_PARENT_CONDUCT
 */
import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, FlatList } from 'react-native';

interface ConductRecord {
  date: string;
  incidentType: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  actions: string[];
}

export default function ParentConductScreen() {
  const [records] = useState<ConductRecord[]>([
    {
      date: '2024-04-20',
      incidentType: 'Positive Behavior',
      description: 'Excellent participation in class discussion',
      severity: 'LOW',
      actions: ['Appreciation', 'Academic Points +5'],
    },
  ]);

  const getSeverityColor = (severity: string) => {
    const colors = { LOW: '#4caf50', MEDIUM: '#ff9800', HIGH: '#f44336' };
    return colors[severity as keyof typeof colors] || '#999';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Conduct Record</Text>
      </View>
      <View style={styles.content}>
        <FlatList
          scrollEnabled={false}
          data={records}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.date}>{item.date}</Text>
                <View style={[styles.badge, { backgroundColor: getSeverityColor(item.severity) }]}>
                  <Text style={styles.badgeText}>{item.severity}</Text>
                </View>
              </View>
              <Text style={styles.incidentType}>{item.incidentType}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#0066cc', padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  content: { padding: 15 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  date: { fontSize: 13, fontWeight: '600', color: '#333' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  incidentType: { fontSize: 14, fontWeight: '600', color: '#0066cc', marginBottom: 6 },
  description: { fontSize: 12, color: '#666' },
});
