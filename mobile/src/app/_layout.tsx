import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../core/theme/ThemeContext';
import { AuthProvider } from '../presentation/context/AuthContext';
import { useAuth } from '../presentation/hooks/useAuth';
import { useEffect } from 'react';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar style="auto" />
           <Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="(tabs)" />
  <Stack.Screen name="attendance" />
</Stack>
        </SafeAreaProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
