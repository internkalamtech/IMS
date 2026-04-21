import { Stack } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LoginScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Login', headerShown: true }} />
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
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
