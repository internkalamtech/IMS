import { DASHBOARD_CONFIG } from '@/core/config/dashboard';
import { useTheme } from '@/core/theme/ThemeContext';
import { QuickActionGrid } from '@/presentation/components/dashboard/QuickActionGrid';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { useAuth } from '@/presentation/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { useDashboard } from '@/presentation/hooks/useDashboard';
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
    const { logout, user } = useAuth();
    const { data: dashboardData, refreshing, onRefresh } = useDashboard();
    const { theme } = useTheme();

    const quickActions = DASHBOARD_CONFIG.teacher.quickActions;

    const upcomingClasses = [
        { id: 1, subject: 'Mathematics', class: 'Class 10-A', time: '09:00 AM', color: '#3b82f6' },
        { id: 2, subject: 'Science', class: 'Class 9-B', time: '10:30 AM', color: '#10b981' },
        { id: 3, subject: 'Physics', class: 'Class 11-A', time: '12:00 PM', color: '#a855f7' },
    ];

    const getStatValue = (label: string, defaultValue: string = '0') => {
        return dashboardData?.stats?.find(s => s.label === label)?.value || defaultValue;
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

            {/* Main Content */}
            <View style={styles.mainContent}>

                {/* Upcoming Classes */}
                {upcomingClasses.map((item, index) => (
                    <View
                        key={item.id}
                        style={[
                            styles.updateItem,
                            index !== upcomingClasses.length - 1 && {
                                borderBottomWidth: 1,
                                borderBottomColor: theme.colors.border,
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.classColorBar,
                                { backgroundColor: item.color },
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

            </View>

        </ScrollView>
    </ThemedView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
scrollView: {
    flex: 1,
},

scrollContent: {
    flexGrow: 1,
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
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
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