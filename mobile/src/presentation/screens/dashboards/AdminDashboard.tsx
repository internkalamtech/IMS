import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
feature/student-profile-ui
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { ThemedCard } from '@/presentation/components/ThemedCard';

import { useAuth } from '@/presentation/hooks/useAuth';
import { router } from 'expo-router';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

import { RefreshControl,
        ScrollView,
        StatusBar,
        TouchableOpacity,
        View,
        StyleSheet
       } from "react-native";
export default function AdminDashboard() {
    const { logout, user } = useAuth();
    const router = useRouter();
    const { data: dashboardData, refreshing, onRefresh } = useDashboard();
    const { theme } = useTheme();
 main

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login' as any); // ✅ FIX ADDED
  };

  const handleActionPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 🔷 HEADER / BANNER */}
        <ThemedView style={styles.banner}>
          <View style={styles.headerContent}>
            <View>
              <ThemedText type="title" style={styles.userName}>
                Admin Dashboard
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Welcome back 👋
              </ThemedText>
            </View>

            <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
              <Ionicons name="log-out-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>

          {/* 🔷 STATS */}
          <View style={styles.bannerStats}>
            <ThemedCard style={styles.bannerStatCard}>
              <ThemedText style={styles.bannerStatValue}>120</ThemedText>
              <ThemedText style={styles.bannerStatTitle}>Students</ThemedText>
            </ThemedCard>

 feature/student-profile-ui
            <ThemedCard style={styles.bannerStatCard}>
              <ThemedText style={styles.bannerStatValue}>15</ThemedText>
              <ThemedText style={styles.bannerStatTitle}>Teachers</ThemedText>
            </ThemedCard>
                    <QuickActionGrid
                        actions={quickActions}
                        onActionPress={(action) => {
                            if (action.title === 'Manage Classes') {
                                router.push('/(tabs)/classes');
                            }
                            if (action.title === 'Timetable') {
                                router.push('/timetable-classes');
                            }
                        }}
                    />
            main

            <ThemedCard style={styles.bannerStatCard}>
              <ThemedText style={styles.bannerStatValue}>8</ThemedText>
              <ThemedText style={styles.bannerStatTitle}>Classes</ThemedText>
            </ThemedCard>
          </View>
        </ThemedView>

        {/* 🔷 ACTIONS */}
        <View style={styles.mainContent}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleActionPress('/students')}
          >
            <ThemedText style={styles.actionText}>Manage Students</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleActionPress('/teachers')}
          >
            <ThemedText style={styles.actionText}>Manage Teachers</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleActionPress('/payments')}
          >
            <ThemedText style={styles.actionText}>View Payments</ThemedText>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },

  banner: {
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },

  userName: {
    marginBottom: 4,
  },

  subtitle: {
    marginTop: 4,
  },

  logoutIcon: {
    padding: 8,
  },

  bannerStats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },

  bannerStatCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
  },

  bannerStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  bannerStatTitle: {
    marginTop: 4,
  },

  mainContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },

  actionButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },

  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
});