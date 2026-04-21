import { Stack } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PaymentsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'View Payments', headerShown: true }} />
      <View style={styles.container}>
        <Text style={styles.title}>View Payments</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});
