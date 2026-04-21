 360-students-overview
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
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
import { SafeAreaView } from 'react-native-safe-area-context';
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

const AdminDashboard = () => {
  const router = useRouter();

 360-students-overview
  const handleLogout = () => {
    // @ts-ignore
    router.replace('/(auth)/login'); // ✅ FIXED
  };
    const handleActionPress = (action: any) => {
      if (action.title === "Manage Classes") {
                router.push('../manage-classes');
      } else if (action.title === "Manage Users") {
                router.push('../add-user');
      }
    };
  main

  return (
    <ScrollView style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Welcome back 👋</Text>
        </View>

        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* STATS SECTION */}
      <View style={styles.statsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardValue}>120</Text>
          <Text style={styles.cardLabel}>Students</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardValue}>15</Text>
          <Text style={styles.cardLabel}>Teachers</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardValue}>8</Text>
          <Text style={styles.cardLabel}>Classes</Text>
        </View>
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          // @ts-ignore
          onPress={() => router.push({ pathname: '/students' })}
        >
          <Text style={styles.actionText}>Manage Students</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          // @ts-ignore
          onPress={() => router.push({ pathname: '/teachers' })}
        >
          <Text style={styles.actionText}>Manage Teachers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          // @ts-ignore
          onPress={() => router.push({ pathname: '/payments' })}
        >
          <Text style={styles.actionText}>View Payments</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
360-students-overview
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f6fa',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },

  logout: {
    color: 'red',
    fontWeight: '600',
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },

  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  cardLabel: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },

  actions: {
    marginTop: 10,
  },

  actionButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },

  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
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
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        gap: 12,
    },
    statIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerStatValue: {
        marginBottom: 4,
    },
    bannerStatTitle: {
        marginTop: 4,
    },
    mainContent: {
        flex: 1,
        marginTop: 0,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        marginBottom: 4,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 12,
    },
    badgeText: {
        marginTop: 2,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    quickActionItem: {
        width: '32%',
        alignItems: 'center',
        marginBottom: 24,
    },
    quickActionIcon: {
        width: 60,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionLabel: {
        marginTop: 8,
        textAlign: 'center',
    },
    updatesCard: {
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 40,
    },
    updateItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    updateIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    updateContent: {
        flex: 1,
    },
    updateTitle: {
        marginBottom: 2,
    },
    updateSubtitle: {
        marginBottom: 4,
    },
    updateTime: {
        marginTop: 4,
    },
    viewLink: {
        fontWeight: '600',
    },
 main
});