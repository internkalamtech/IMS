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
import { RefreshControl, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TransportDashboard() {
  const { logout, user } = useAuth();
  const { data: dashboardData, refreshing, onRefresh } = useDashboard();
  const { theme, isDark } = useTheme();

  const quickActions = DASHBOARD_CONFIG.transport.quickActions;

  const getStatValue = (label: string, defaultValue: string = '0') => {
    return dashboardData?.stats?.find((s) => s.label === label)?.value || defaultValue;
  };

  const stats = [
    { title: 'Active Routes', value: getStatValue('Active Routes', '14'), icon: 'bus' },
    { title: 'Fleet Availability', value: getStatValue('Fleet Availability', '92%'), icon: 'car' },
    { title: 'Pending Requests', value: getStatValue('Pending Requests', '5'), icon: 'alert-circle' },
  ];

  const updates = [
    { id: '1', title: 'Route 12 completed on time', time: '15 min ago' },
    { id: '2', title: 'Bus #8 requires inspection', time: '1 hour ago' },
    { id: '3', title: 'New driver assigned to Route 3', time: 'Yesterday' },
  ];

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'light-content'} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        <View style={[styles.banner, { backgroundColor: theme.colors.primary }]}> 
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <View>
                <ThemedText style={styles.userName} type="title" color="primaryForeground">
                  {user?.name || 'Transport Manager'}
                </ThemedText>
                <ThemedText style={styles.subtitle} color="primaryForeground">
                  Transport operations at a glance
                </ThemedText>
              </View>
              <TouchableOpacity onPress={logout} style={styles.logoutIcon}>
                <Ionicons name="log-out-outline" size={24} color={theme.colors.primaryForeground} />
              </TouchableOpacity>
            </View>

            <View style={styles.bannerStats}>
              {stats.map((stat, index) => (
                <View key={index} style={[styles.bannerStatCard, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name={stat.icon as any} size={24} color={theme.colors.primaryForeground} />
                  </View>
                  <View>
                    <ThemedText style={styles.bannerStatValue} type="title" color="primaryForeground">
                      {stat.value}
                    </ThemedText>
                    <ThemedText style={styles.bannerStatTitle} color="primaryForeground">
                      {stat.title}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </SafeAreaView>
        </View>

        <View style={[styles.mainContent, { backgroundColor: theme.colors.background }]}> 
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle} type="subtitle">
              Quick Actions
            </ThemedText>
          </View>

          <QuickActionGrid actions={quickActions} />

          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle} type="subtitle">
              Recent Transport Updates
            </ThemedText>
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}> 
              <ThemedText style={styles.badgeText} color="primaryForeground">
                {updates.length} new
              </ThemedText>
            </View>
          </View>

          <ThemedCard style={styles.updatesCard} padding={0}>
            {updates.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.updateItem,
                  index !== updates.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                ]}
              >
                <View style={[styles.updateIcon, { backgroundColor: theme.colors.primary + '10' }]}> 
                  <Ionicons name="bus-outline" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.updateContent}>
                  <ThemedText style={styles.updateTitle} type="defaultSemiBold">
                    {item.title}
                  </ThemedText>
                  <ThemedText style={styles.updateTime}>{item.time}</ThemedText>
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
  banner: { paddingBottom: 30, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  userName: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 16, marginTop: 4 },
  logoutIcon: { padding: 8 },
  bannerStats: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
  bannerStatCard: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, gap: 12 },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerStatValue: { fontSize: 22, fontWeight: '700' },
  bannerStatTitle: { fontSize: 12 },
  mainContent: { flex: 1, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  updatesCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 40 },
  updateItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  updateIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  updateContent: { flex: 1 },
  updateTitle: { fontSize: 15, marginBottom: 2 },
  updateTime: { fontSize: 11, color: '#6b7280' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
