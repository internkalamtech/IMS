/**
 * Transport Portal - Vehicle & Route Management
 * PHASE 7, EPIC_TRANSPORT_DASHBOARD
 * 
 * Transport manager manages vehicles, routes, and driver information
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';

interface Vehicle {
  vehicleId: string;
  busNumber: string;
  capacity: number;
  registrationNo: string;
  status: 'active' | 'maintenance' | 'inactive';
  driver: string;
}

interface Route {
  routeId: string;
  routeName: string;
  stops: number;
  distance: number;
  vehicles: number;
}

interface TransportData {
  totalVehicles: number;
  activeVehicles: number;
  totalRoutes: number;
  vehicles: Vehicle[];
  routes: Route[];
}

export default function TransportDashboardScreen() {
  const [transportData, setTransportData] = useState<TransportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'vehicles' | 'routes'>('vehicles');

  useEffect(() => {
    loadTransportData();
  }, []);

  const loadTransportData = async () => {
    try {
      setLoading(true);
      const mockData: TransportData = {
        totalVehicles: 12,
        activeVehicles: 10,
        totalRoutes: 8,
        vehicles: [
          { vehicleId: 'v1', busNumber: 'BUS-001', capacity: 50, registrationNo: 'DL-01-AB-1234', status: 'active', driver: 'Raj Kumar' },
          { vehicleId: 'v2', busNumber: 'BUS-002', capacity: 45, registrationNo: 'DL-01-AB-1235', status: 'active', driver: 'Amit Singh' },
          { vehicleId: 'v3', busNumber: 'BUS-003', capacity: 50, registrationNo: 'DL-01-AB-1236', status: 'maintenance', driver: 'Priya Sharma' },
        ],
        routes: [
          { routeId: 'r1', routeName: 'North Route', stops: 12, distance: 45.5, vehicles: 2 },
          { routeId: 'r2', routeName: 'South Route', stops: 10, distance: 38.2, vehicles: 2 },
          { routeId: 'r3', routeName: 'East Route', stops: 15, distance: 52.0, vehicles: 3 },
        ],
      };
      setTransportData(mockData);
      setError(null);
    } catch (err) {
      setError('Failed to load transport data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return '#4caf50';
      case 'maintenance':
        return '#ffc107';
      case 'inactive':
        return '#f44336';
      default:
        return '#999';
    }
  };

  const renderVehicleItem = ({ item }: { item: Vehicle }) => (
    <View style={styles.vehicleCard}>
      <View style={styles.vehicleHeader}>
        <Text style={styles.busNumber}>{item.busNumber}</Text>
        <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
      <View style={styles.vehicleDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Driver:</Text>
          <Text style={styles.value}>{item.driver}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Capacity:</Text>
          <Text style={styles.value}>{item.capacity} seats</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Registration:</Text>
          <Text style={styles.value}>{item.registrationNo}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.viewButton}>
        <Text style={styles.viewButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRouteItem = ({ item }: { item: Route }) => (
    <View style={styles.routeCard}>
      <View style={styles.routeHeader}>
        <Text style={styles.routeName}>{item.routeName}</Text>
        <Text style={styles.vehicleCount}>{item.vehicles} vehicles</Text>
      </View>
      <View style={styles.routeDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Stops:</Text>
          <Text style={styles.value}>{item.stops}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Distance:</Text>
          <Text style={styles.value}>{item.distance} km</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.viewButton}>
        <Text style={styles.viewButtonText}>View Route</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transport Management</Text>
        <Text style={styles.subtitle}>Manage vehicles and routes</Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {transportData && (
        <View style={styles.content}>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxValue}>{transportData.totalVehicles}</Text>
              <Text style={styles.statBoxLabel}>Total Vehicles</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statBoxValue}>{transportData.activeVehicles}</Text>
              <Text style={styles.statBoxLabel}>Active Vehicles</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statBoxValue}>{transportData.totalRoutes}</Text>
              <Text style={styles.statBoxLabel}>Total Routes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statBoxValue}>{Math.round((transportData.activeVehicles / transportData.totalVehicles) * 100)}%</Text>
              <Text style={styles.statBoxLabel}>Utilization</Text>
            </View>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'vehicles' && styles.activeTab]}
              onPress={() => setSelectedTab('vehicles')}
            >
              <Text style={[styles.tabText, selectedTab === 'vehicles' && styles.activeTabText]}>
                Vehicles
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'routes' && styles.activeTab]}
              onPress={() => setSelectedTab('routes')}
            >
              <Text style={[styles.tabText, selectedTab === 'routes' && styles.activeTabText]}>
                Routes
              </Text>
            </TouchableOpacity>
          </View>

          {selectedTab === 'vehicles' && (
            <View>
              <Text style={styles.sectionTitle}>Fleet Management</Text>
              <FlatList
                data={transportData.vehicles}
                renderItem={renderVehicleItem}
                keyExtractor={(item) => item.vehicleId}
                scrollEnabled={false}
              />
            </View>
          )}

          {selectedTab === 'routes' && (
            <View>
              <Text style={styles.sectionTitle}>Active Routes</Text>
              <FlatList
                data={transportData.routes}
                renderItem={renderRouteItem}
                keyExtractor={(item) => item.routeId}
                scrollEnabled={false}
              />
            </View>
          )}

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Add New Vehicle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { marginBottom: 30, backgroundColor: '#666' }]}>
            <Text style={styles.actionButtonText}>Add New Route</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#0066cc', padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#e3f2fd', marginTop: 5 },
  content: { padding: 15 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 10, padding: 15, alignItems: 'center', elevation: 2 },
  statBoxValue: { fontSize: 28, fontWeight: 'bold', color: '#0066cc', marginBottom: 5 },
  statBoxLabel: { fontSize: 11, color: '#666', textAlign: 'center' },
  tabContainer: { flexDirection: 'row', marginBottom: 15, gap: 10 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#ddd' },
  activeTab: { borderBottomColor: '#0066cc' },
  tabText: { fontSize: 12, color: '#666', fontWeight: '500' },
  activeTabText: { color: '#0066cc', fontWeight: '700' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10 },
  vehicleCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 12, elevation: 1, borderLeftWidth: 4, borderLeftColor: '#0066cc' },
  vehicleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  busNumber: { fontSize: 16, fontWeight: '700', color: '#0066cc' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, fontSize: 10, fontWeight: 'bold', color: '#fff' },
  vehicleDetails: { marginBottom: 12 },
  routeCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 12, elevation: 1, borderLeftWidth: 4, borderLeftColor: '#4caf50' },
  routeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  routeName: { fontSize: 16, fontWeight: '700', color: '#0066cc' },
  vehicleCount: { fontSize: 12, fontWeight: '600', color: '#999' },
  routeDetails: { marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  label: { fontSize: 12, color: '#666', fontWeight: '500' },
  value: { fontSize: 12, color: '#333', fontWeight: '600' },
  viewButton: { backgroundColor: '#0066cc', padding: 8, borderRadius: 6, alignItems: 'center' },
  viewButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  actionButton: { backgroundColor: '#0066cc', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  actionButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  loader: { marginVertical: 30 },
  errorText: { color: '#f44336', fontSize: 14, padding: 15, textAlign: 'center' },
});
