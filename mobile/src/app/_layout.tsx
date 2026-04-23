<<<<<<< HEAD
// Tabs layout for the app
// This defines the bottom tab navigation

import { Stack } from 'expo-router';
=======
import { Stack, useRouter } from 'expo-router';
>>>>>>> c05063ab8805c5607463b099aa7def04f3ee9858
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
           <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
