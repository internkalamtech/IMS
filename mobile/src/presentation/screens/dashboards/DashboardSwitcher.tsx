import { useTheme } from '@/core/theme/ThemeContext';
import { ThemedButton } from '@/presentation/components/ThemedButton';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { useAuth } from '@/presentation/hooks/useAuth';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import LoginScreen from '../LoginScreen';
import MaintenanceScreen from '../MaintenanceScreen';
import AdminDashboard from './AdminDashboard';
import ParentDashboard from './ParentDashboard';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';

export default function DashboardSwitcher() {
  const { logout, user } = useAuth();
  const { theme } = useTheme();

  if (!user) return <LoginScreen />;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'parent':
      return <ParentDashboard />;
    case 'driver':
      return <MaintenanceScreen />;
    default:
      return (
        <ThemedView style={styles.container}>
          <View style={styles.content}>
            <ThemedCard style={styles.card}>
              <ThemedText type="title" style={styles.title}>
                Signed in successfully
              </ThemedText>
              <ThemedText style={styles.body}>
                Your account role is `{user.role}`, but no dashboard is available.
              </ThemedText>
              <ThemedText style={[styles.roleChip, { color: theme.colors.primary }]}>
                {user.name} - {user.email}
              </ThemedText>
              <ThemedButton title="Logout" onPress={logout} style={styles.button} />
            </ThemedCard>
          </View>
        </ThemedView>
      );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  card: { padding: 24, borderRadius: 24 },
  title: { marginBottom: 12, textAlign: 'center' },
  body: { textAlign: 'center', marginBottom: 12, lineHeight: 22 },
  roleChip: { textAlign: 'center', marginBottom: 20, fontWeight: '600' },
  button: { marginTop: 8 },
});