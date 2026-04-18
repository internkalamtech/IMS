import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

const AdminDashboard = () => {
  const router = useRouter();

  const handleLogout = () => {
    // @ts-ignore
    router.replace('/(auth)/login'); // ✅ FIXED
  };

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
});