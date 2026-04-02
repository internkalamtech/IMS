import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

type DashboardData = {
  totalStudents: number;
  totalClasses: number;
  notifications: number;
};

const TeacherDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Note: 10.0.2.2 is correct for Android Emulator to hit localhost
        const res = await fetch('http://10.0.2.2:8000/teacher/dashboard');

        if (!res.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const json: DashboardData = await res.json();
        setData(json);
      } catch (err) {
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Internal Helper Component
  const Card = ({ title, value }: { title: string; value: number }) => {
    return (
      <View style={styles.card}>
        <Text>{title}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Teacher Dashboard</Text>

      {data ? (
        <View>
          <Card title="Total Students" value={data.totalStudents || 0} />
          <View style={styles.spacing} />
          <Card title="Total Classes" value={data.totalClasses || 0} />
          <View style={styles.spacing} />
          <Card title="Notifications" value={data.notifications || 0} />
        </View>
      ) : (
        <Text>No data available</Text>
      )}
    </View>
  );
}; // <--- This closing brace was missing!

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F6F2',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  spacing: {
    height: 15,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TeacherDashboard;