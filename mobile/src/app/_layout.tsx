import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../core/theme/ThemeContext';
import { AuthProvider } from '../presentation/context/AuthContext';
import { useAuth } from '../presentation/hooks/useAuth';
import { useEffect } from 'react';

function RootNavigation() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/'); // 👈 login screen (adjust if needed)
      } else {
        router.replace('/(tabs)'); // 👈 main app
      }
    }
  }, [user, loading]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <RootNavigation />
        </SafeAreaProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}