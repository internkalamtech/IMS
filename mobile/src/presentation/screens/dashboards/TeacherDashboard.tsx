import { DASHBOARD_CONFIG } from '@/core/config/dashboard';
import { useTheme } from '@/core/theme/ThemeContext';
import { QuickActionGrid } from '@/presentation/components/dashboard/QuickActionGrid';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useDashboard } from '@/presentation/hooks/useDashboard';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function TeacherDashboard() {
  const { logout, user } = useAuth();
  const { refreshing, onRefresh } = useDashboard();
  const { theme } = useTheme();
  const router = useRouter();

  // ✅ SAFE ACCESS
  const quickActions = DASHBOARD_CONFIG?.teacher?.quickActions || [];

  // ✅ SAFE HANDLER
  const handleActionPress = (action: any) => {
  console.log("Clicked:", action);

  if (action.title === "Homework" || action.label === "Homework") {
    router.push("/homework");
  }
};

  const upcomingClasses = [
    { id: 1, subject: 'Mathematics', class: 'Class 10-A', time: '09:00 AM' },
    { id: 2, subject: 'Science', class: 'Class 9-B', time: '10:30 AM' },
    { id: 3, subject: 'Physics', class: 'Class 11-A', time: '12:00 PM' },
  ];

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* HEADER */}
        <View style={[styles.banner, { backgroundColor: theme?.colors?.primary }]}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <View>
                <ThemedText style={styles.userName} color="primaryForeground">
                  Hello, {user?.name?.split(' ')[0] || 'Teacher'} 👋
                </ThemedText>

                <ThemedText color="primaryForeground">
                  Your academic day
                </ThemedText>
              </View>

              <TouchableOpacity onPress={logout}>
                <Ionicons name="log-out-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* MAIN */}
        <View style={[styles.mainContent, { backgroundColor: theme?.colors?.background }]}>
          <ThemedText style={styles.sectionTitle}>Teacher Tools</ThemedText>

          <QuickActionGrid
            actions={quickActions}
            onActionPress={handleActionPress}
          />

          <ThemedText style={styles.sectionTitle}>Upcoming Classes</ThemedText>

          <ThemedCard>
            {upcomingClasses.map((item) => (
              <View key={item.id} style={styles.updateItem}>
                <Text>{item.subject} - {item.class}</Text>
                <Text>{item.time}</Text>
              </View>
            ))}
          </ThemedCard>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  banner: { padding: 20 },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  mainContent: {
    padding: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  updateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
});