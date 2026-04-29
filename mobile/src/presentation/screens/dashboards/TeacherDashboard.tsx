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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

type DashboardData = {
  totalStudents: number;
  totalClasses: number;
  notifications: number;
};

export default function TeacherDashboard() {
  const { logout, user } = useAuth();
  const { data: dashboardData, refreshing, onRefresh } = useDashboard();
  const { theme } = useTheme();
  const [data, setData] = useState<DashboardData | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

  const quickActions = DASHBOARD_CONFIG.teacher.quickActions;

  const upcomingClasses = [
    { id: 1, subject: 'Mathematics', class: 'Class 10-A', time: '09:00 AM', color: '#3b82f6' },
    { id: 2, subject: 'Science', class: 'Class 9-B', time: '10:30 AM', color: '#10b981' },
    { id: 3, subject: 'Physics', class: 'Class 11-A', time: '12:00 PM', color: '#a855f7' },
  ];

  const getStatValue = (label: string, defaultValue: string = '0') => {
    return dashboardData?.stats?.find((s: any) => s.label === label)?.value || defaultValue;
  };
  useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const res = await fetch('http://10.0.2.2:8000/teacher/dashboard');

      if (!res.ok) throw new Error('Failed');

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  fetchDashboard();
}, []);
if (loading) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText>Loading...</ThemedText>
    </ThemedView>
  );
}

if (error) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText>{error}</ThemedText>
    </ThemedView>
  );
}

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {/* HEADER */}
        <View style={[styles.banner, { backgroundColor: theme.colors.primary }]}>
          <SafeAreaView>
            <View style={styles.headerContent}>
              <View>
                <ThemedText style={styles.userName}>
                  Hello, {user?.name || 'Teacher'}
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                  Dashboard Overview
                </ThemedText>
              </View>

              <TouchableOpacity onPress={logout}>
                <Ionicons name="log-out-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <QuickActionGrid
              actions={quickActions}
              onActionPress={(action) => {
                if (action.route) {
                  router.push(action.route as any);
                }
              }}
            />
            <View style={styles.sectionHeader}>
  <ThemedText style={styles.sectionTitle} type="defaultSemiBold">
    Dashboard Summary
  </ThemedText>
</View>

<ThemedCard style={styles.updatesCard}>
  <ThemedText>Total Students: {data?.totalStudents || 0}</ThemedText>
  <ThemedText>Total Classes: {data?.totalClasses || 0}</ThemedText>
  <ThemedText>Notifications: {data?.notifications || 0}</ThemedText>
</ThemedCard>

            {/* Upcoming Classes */}
            <View style={styles.sectionHeader}>
              <ThemedText
                style={styles.sectionTitle}
                type="defaultSemiBold"
              >
                Upcoming Classes
              </ThemedText>
            </View>

            <ThemedCard
              style={styles.updatesCard}
              padding={0}
            >
              {
              upcomingClasses.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.updateItem,
                    index !== upcomingClasses.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor:
                        theme.colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.classColorBar,
                      {
                        backgroundColor: item.color,
                      },
                    ]}
                  />

                <View style={styles.updateContent}>
                  <ThemedText>{item.subject}</ThemedText>
                  <ThemedText>{item.class}</ThemedText>
                </View>

                <ThemedText>{item.time}</ThemedText>
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

  banner: {
    padding: 16,
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
  },

  mainContent: {
    padding: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
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
  },

  updateContent: {
    flex: 1,
  },
});