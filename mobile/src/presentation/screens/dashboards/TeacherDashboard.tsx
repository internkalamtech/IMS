import { useTheme } from '@/core/theme/ThemeContext';
import { QuickActionGrid } from '@/presentation/components/dashboard/QuickActionGrid';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { useAuth } from '@/presentation/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function TeacherDashboard() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { theme } = useTheme();

  const refreshing = false;

  const onRefresh = () => {
    console.log('Refreshing...');
  };

  // SAFE ACCESS
  const quickActions =
    DASHBOARD_CONFIG?.teacher?.quickActions || [];

  const upcomingClasses = [
    {
      id: 1,
      subject: 'Mathematics',
      class: 'Class 10-A',
      time: '09:00 AM',
      color: '#4CAF50',
    },
    {
      id: 2,
      subject: 'Science',
      class: 'Class 9-B',
      time: '10:30 AM',
      color: '#2196F3',
    },
    {
      id: 3,
      subject: 'Physics',
      class: 'Class 11-A',
      time: '12:00 PM',
      color: '#FF9800',
    },
  ];

  useEffect(() => {
    if (!user) {
      router.replace('/');
    }
  }, [user, router]);

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {/* HEADER */}
        <View
          style={[
            styles.banner,
            {
              backgroundColor: theme?.colors?.primary,
            },
          ]}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <View>
                <ThemedText
                  style={styles.userName}
                  type="defaultSemiBold"
                  lightColor={theme.colors.primaryForeground}
                  darkColor={theme.colors.primaryForeground}
                >
                  Hello, {user?.name?.split(' ')[0] || 'Teacher'} 👋
                </ThemedText>

                <ThemedText
                  style={styles.subtitle}
                  lightColor={theme.colors.primaryForeground}
                  darkColor={theme.colors.primaryForeground}
                >
                  Your academic day at a glance
                </ThemedText>
              </View>

              <TouchableOpacity
                onPress={() => {
                  logout();
                  router.replace('/');
                }}
              >
                <Ionicons
                  name="log-out-outline"
                  size={24}
                  color={theme.colors.primaryForeground}
                />
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
              {upcomingClasses.map((item, index) => (
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
                    <ThemedText
                      style={styles.updateTitle}
                      type="defaultSemiBold"
                    >
                      {item.subject}
                    </ThemedText>

                    <ThemedText
                      style={styles.updateSubtitle}
                      lightColor="#666"
                      darkColor="#999"
                    >
                      {item.class}
                    </ThemedText>
                  </View>

                  <View
                    style={[
                      styles.timeTag,
                      {
                        backgroundColor:
                          theme.colors.primary + '10',
                      },
                    ]}
                  >
                    <ThemedText
                      style={{
                        color: theme.colors.primary,
                        fontSize: 12,
                      }}
                      type="defaultSemiBold"
                    >
                      {item.time}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </ThemedCard>
          </SafeAreaView>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  banner: {
    padding: 20,
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
  },

  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
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
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  classColorBar: {
    width: 6,
    height: 42,
    borderRadius: 10,
    marginRight: 12,
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
  },
});