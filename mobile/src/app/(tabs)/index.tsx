import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthContext } from '@/presentation/context/AuthContext';
import LoginScreen from '@/presentation/screens/LoginScreen';
import Teacher2Dashboard from '@/presentation/screens/dashboards/Teacher2Dashboard';

export default function DashboardSwitcher() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <Teacher2Dashboard />;
}