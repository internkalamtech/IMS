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
import { useRouter } from 'expo-router';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TeacherDashboard() {
  const { logout, user } = useAuth();
  const { data: dashboardData, refreshing, onRefresh } = useDashboard();
  const { theme } = useTheme();
  const router = useRouter();

  const quickActions = DASHBOARD_CONFIG.teacher.quickActions;
const handleQuickActionPress = (action: any) => {
  console.log('Clicked action:', action.title, action.route);

  if (action.route) {
    router.push(action.route as any);
  }
};
  const upcomingClasses = [
    { id: 1, subject: 'Mathematics', class: 'Class 10-A', time: '09:00 AM', color: '#3b82f6' },
    { id: 2, subject: 'Science', class: 'Class 9-B', time: '10:30 AM', color: '#10b981' },
    { id: 3, subject: 'Physics', class: 'Class 11-A', time: '12:00 PM', color: '#a855f7' },
  ];

  const getStatValue = (label: string, defaultValue: string = '0') => {
    return dashboardData?.stats?.find((s: any) => s.label === label)?.value || defaultValue;
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primaryForeground}
          />
        }
      >
        {/* 🔹 Banner */}
        <View style={[styles.banner, { backgroundColor: theme.colors.primary }]}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <View>
                <ThemedText style={styles.userName}>
                  Hello, {user?.name?.split(' ')[0] || 'Teacher'} 👋
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                  Your academic day at a glance
                </ThemedText>
              </View>

              <TouchableOpacity onPress={logout}>
                <Ionicons name="log-out-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* 🔹 Stats */}
            <View style={styles.bannerStats}>
              <View style={styles.statCard}>
                <ThemedText>{getStatValue('Total Students', '42')}</ThemedText>
                <ThemedText>My Students</ThemedText>
              </View>

              <View style={styles.statCard}>
                <ThemedText>{getStatValue("Today's Classes", "5")}</ThemedText>
                <ThemedText>Classes Today</ThemedText>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* 🔹 Main Content */}
        <View style={styles.mainContent}>
          
          {/* QUICK ACTIONS */}
          <ThemedText style={styles.sectionTitle}>Teacher Tools</ThemedText>
          <QuickActionGrid
            actions={quickActions}
             onActionPress={handleQuickActionPress}
          />

          {/* Upcoming Classes */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Upcoming Classes
            </ThemedText>
          </View>

          <ThemedCard style={styles.updatesCard}>
            {upcomingClasses.map((item) => (
              <View key={item.id} style={styles.updateItem}>
                <View
                  style={[
                    styles.classColorBar,
                    { backgroundColor: item.color },
                  ]}
                />

                <View style={styles.updateContent}>
                  <ThemedText style={styles.updateTitle}>
                    {item.subject}
                  </ThemedText>

                  <ThemedText style={styles.updateSubtitle}>
                    {item.class}
                  </ThemedText>
                </View>

                <View style={styles.timeTag}>
                  <ThemedText>{item.time}</ThemedText>
                </View>
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

  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  banner: {
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: 14,
  },

  bannerStats: {
    flexDirection: 'row',
    gap: 10,
  },

  statCard: {
    backgroundColor: '#ffffff30',
    padding: 10,
    borderRadius: 8,
    flex: 1,
  },

  mainContent: {
    padding: 16,
  },

  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  updatesCard: {
    marginTop: 8,
  },

  updateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },

  classColorBar: {
    width: 5,
    height: 40,
    marginRight: 10,
    borderRadius: 4,
  },

  updateContent: {
    flex: 1,
  },

  updateTitle: {
    fontSize: 15,
  },

  updateSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },

  timeTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
});