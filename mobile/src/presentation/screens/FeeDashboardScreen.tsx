/**
 * FeeDashboardScreen.tsx
 * STORY_COLLECTION_ANALYTICS - Fee Dashboard & Analytics (Admin)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from 'react-native';

interface DashboardStats {
  totalCollectible: number;
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  collectionPercentage: number;
  studentsCount: number;
  paidStudents: number;
  pendingStudents: number;
  overdueStudents: number;
}

interface CollectionTrend {
  month: string;
  collected: number;
  target: number;
}

export const FeeDashboardScreen: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<CollectionTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await feeAnalyticsService.getDashboard();
      // setStats(response.stats);
      // setTrends(response.trends);
      console.log('Fetching fee dashboard data...');
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    label: string;
    value: number | string;
    unit?: string;
    color?: string;
  }> = ({ label, value, unit = '₹', color = '#2196F3' }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueContainer}>
        <Text style={[styles.statValue, { color }]}>
          {typeof value === 'number' ? (unit === '%' ? `${value}%` : `${unit}${value}`) : value}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Finance Dashboard</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchDashboardData}>
          <Text style={styles.refreshText}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Key Metrics Cards */}
      <View style={styles.cardsContainer}>
        <StatCard label="Total Collectible" value={stats?.totalCollectible || 0} color="#2196F3" />
        <StatCard label="Total Collected" value={stats?.totalCollected || 0} color="#4CAF50" />
        <StatCard label="Pending Amount" value={stats?.totalPending || 0} color="#FF9800" />
        <StatCard label="Overdue Amount" value={stats?.totalOverdue || 0} color="#f44336" />
      </View>

      {/* Collection Percentage Card */}
      <View style={styles.percentageCard}>
        <Text style={styles.percentageLabel}>Collection Rate</Text>
        <View style={styles.percentageContent}>
          <View style={styles.percentageChart}>
            <View
              style={[
                styles.percentageFill,
                { width: `${stats?.collectionPercentage || 0}%` },
              ]}
            />
          </View>
          <Text style={styles.percentageValue}>{stats?.collectionPercentage || 0}%</Text>
        </View>
      </View>

      {/* Student Breakdown */}
      <View style={[styles.section, { marginBottom: 16 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Student Breakdown</Text>
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text style={styles.expandToggle}>{expanded ? '▼' : '▶'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.breakdownContainer}>
          <View style={[styles.breakdownItem, { borderLeftColor: '#4CAF50' }]}>
            <Text style={styles.breakdownLabel}>Paid</Text>
            <Text style={[styles.breakdownValue, { color: '#4CAF50' }]}>
              {stats?.paidStudents || 0}
            </Text>
            <Text style={styles.breakdownSubtitle}>out of {stats?.studentsCount || 0}</Text>
          </View>

          <View style={[styles.breakdownItem, { borderLeftColor: '#FF9800' }]}>
            <Text style={styles.breakdownLabel}>Pending</Text>
            <Text style={[styles.breakdownValue, { color: '#FF9800' }]}>
              {stats?.pendingStudents || 0}
            </Text>
            <Text style={styles.breakdownSubtitle}>Partial paid</Text>
          </View>

          <View style={[styles.breakdownItem, { borderLeftColor: '#f44336' }]}>
            <Text style={styles.breakdownLabel}>Overdue</Text>
            <Text style={[styles.breakdownValue, { color: '#f44336' }]}>
              {stats?.overdueStudents || 0}
            </Text>
            <Text style={styles.breakdownSubtitle}>Action needed</Text>
          </View>
        </View>
      </View>

      {expanded && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Analytics</Text>
          
          <View style={styles.analyticsRow}>
            <View style={styles.analyticsCol}>
              <Text style={styles.analyticsLabel}>Avg. Fee per Student</Text>
              <Text style={styles.analyticsValue}>
                ₹{Math.round((stats?.totalCollectible || 0) / (stats?.studentsCount || 1))}
              </Text>
            </View>
            <View style={styles.analyticsCol}>
              <Text style={styles.analyticsLabel}>Avg. Paid per Student</Text>
              <Text style={[styles.analyticsValue, { color: '#4CAF50' }]}>
                ₹{Math.round((stats?.totalCollected || 0) / (stats?.studentsCount || 1))}
              </Text>
            </View>
          </View>

          <View style={styles.analyticsRow}>
            <View style={styles.analyticsCol}>
              <Text style={styles.analyticsLabel}>Outstanding Amount</Text>
              <Text style={[styles.analyticsValue, { color: '#FF9800' }]}>
                ₹{stats?.totalPending || 0}
              </Text>
            </View>
            <View style={styles.analyticsCol}>
              <Text style={styles.analyticsLabel}>Overdue Amount</Text>
              <Text style={[styles.analyticsValue, { color: '#f44336' }]}>
                ₹{stats?.totalOverdue || 0}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Export/Download Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reports</Text>
        <TouchableOpacity style={styles.reportButton}>
          <Text style={styles.reportButtonText}>📊 Download Payment Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reportButton}>
          <Text style={styles.reportButtonText}>📋 Download Overdue List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reportButton}>
          <Text style={styles.reportButtonText}>📈 Export Analytics (CSV)</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Send Payment Reminders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Generate Receipts</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  refreshText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cardsContainer: {
    padding: 8,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    marginBottom: 8,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  percentageCard: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  percentageLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  percentageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentageChart: {
    flex: 1,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 12,
  },
  percentageFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  percentageValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    minWidth: 50,
    textAlign: 'right',
  },
  section: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  expandToggle: {
    fontSize: 12,
    color: '#999',
  },
  breakdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  breakdownItem: {
    flex: 1,
    borderLeftWidth: 4,
    paddingLeft: 12,
    marginRight: 8,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  breakdownSubtitle: {
    fontSize: 11,
    color: '#ccc',
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  analyticsCol: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  analyticsLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 8,
  },
  analyticsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reportButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2196F3',
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
