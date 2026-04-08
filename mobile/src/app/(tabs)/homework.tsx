import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeworkScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Homework</Text>
      <Text style={styles.subtitle}>
        Your homework tasks will appear here once available.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});