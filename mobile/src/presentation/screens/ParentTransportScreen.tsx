/**
 * Parent Portal - Bus Tracking
 * PHASE 4, EPIC_PARENT_TRANSPORT
 * 
 * Parents track bus location, schedules, and routes
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
import { ParentTransportService } from '../../data/services/allPortalServices';

interface BusStop {
  stopId: string;
  stopName: string;
  arrivalTime: string;
  distance: number;
}

interface BusLocation {
  vehicleId: string;
  busNumber: string;
  latitude: number;
  longitude: number;
  currentSpeed: number;
  driver: string;
  status: 'on_route' | 'at_stop' | 'completed';
}

interface TransportData {
  studentId: string;
  studentName: string;
  schedule: BusStop[];
  busLocation: BusLocation;
}

export default function ParentTransportScreen() {
  const [transportData, setTransportData] = useState<TransportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState('student_001');

  useEffect(() => {
    loadTransportData();
  }, [selectedStudent]);

  const loadTransportData = async () => {
    try {
      setLoading(true);
      const service = new ParentTransportService();
      const schedule = await service.getBusSchedule(selectedStudent);
      const location = await service.getRealTimeLocation('bus_001');
      setTransportData({
        studentId: selectedStudent,
        studentName: 'Raj Kumar',
        schedule: schedule,
        busLocation: location,
      });
      setError(null);
    } catch (err) {
      setError('Failed to load transport data');
      Alert.alert('Error', 'Could not load bus information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'on_route':
        return '#4caf50';
      case 'at_stop':
        return '#ffc107';
      case 'completed':
        return '#999';
      default:
        return '#0066cc';
    }
  };

  const renderStopItem = ({ item }: { item: BusStop }) => (
    <View style={styles.stopCard}>
      <View style={styles.stopHeader}>
        <Text style={styles.stopName}>{item.stopName}</Text>
        <Text style={styles.distance}>{item.distance} km</Text>
      </View>
      <View style={styles.stopDetails}>
        <Text style={styles.label}>Arrival Time:</Text>
        <Text style={styles.arrivalTime}>{item.arrivalTime}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bus Tracking</Text>
        <Text style={styles.subtitle}>Real-time location and schedule</Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {transportData && (
        <View style={styles.content}>
          <View style={styles.statusCard}>
            <Text style={styles.cardTitle}>Bus Status</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusDot}>?</Text>
                <Text style={[styles.statusText, { color: getStatusColor(transportData.busLocation.status) }]}>
                  {transportData.busLocation.status === 'on_route' ? 'On Route' : 'At Stop'}
                </Text>
              </View>
            </View>
            <View style={styles.busInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Bus Number:</Text>
                <Text style={styles.value}>{transportData.busLocation.busNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Driver:</Text>
                <Text style={styles.value}>{transportData.busLocation.driver}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Current Speed:</Text>
                <Text style={styles.value}>{transportData.busLocation.currentSpeed} km/h</Text>
              </View>
            </View>
          </View>

          <View style={styles.coordinatesCard}>
            <Text style={styles.cardTitle}>Current Location</Text>
            <View style={styles.coordinateRow}>
              <Text style={styles.label}>Latitude:</Text>
              <Text style={styles.coordinate}>{transportData.busLocation.latitude.toFixed(4)}</Text>
            </View>
            <View style={styles.coordinateRow}>
              <Text style={styles.label}>Longitude:</Text>
              <Text style={styles.coordinate}>{transportData.busLocation.longitude.toFixed(4)}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Today Route</Text>
          <FlatList
            data={transportData.schedule}
            renderItem={renderStopItem}
            keyExtractor={(item) => item.stopId}
            scrollEnabled={false}
          />

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View Full Route Map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { marginBottom: 30 }]}>
            <Text style={styles.actionButtonText}>Enable Notifications</Text>
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
  statusCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 2 },
  coordinatesCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15, color: '#333' },
  statusContainer: { alignItems: 'center', marginBottom: 15 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  statusDot: { fontSize: 18, marginRight: 8 },
  statusText: { fontSize: 14, fontWeight: '600' },
  busInfo: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  label: { fontSize: 12, color: '#666', fontWeight: '500' },
  value: { fontSize: 12, color: '#333', fontWeight: '600' },
  coordinateRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  coordinate: { fontSize: 12, color: '#0066cc', fontWeight: '600', fontFamily: 'monospace' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10 },
  stopCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 12, elevation: 1, borderLeftWidth: 4, borderLeftColor: '#0066cc' },
  stopHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  stopName: { fontSize: 14, fontWeight: '600', color: '#0066cc' },
  distance: { fontSize: 12, color: '#999', fontWeight: '600' },
  stopDetails: { marginTop: 8 },
  arrivalTime: { fontSize: 13, fontWeight: '600', color: '#333', marginTop: 4 },
  actionButton: { backgroundColor: '#0066cc', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  actionButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  loader: { marginVertical: 30 },
  errorText: { color: '#f44336', fontSize: 14, padding: 15, textAlign: 'center' },
});
