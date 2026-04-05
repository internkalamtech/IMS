import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../core/theme/ThemeContext';
import { AuthProvider } from '../presentation/context/AuthContext';
console.log("TABS LAYOUT LOADED");
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


