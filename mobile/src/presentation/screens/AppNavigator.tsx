import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '@/presentation/screens/LoginScreen';
import Teacher2Dashboard from '@/presentation/screens/Teacher2Dashboard';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Teacher2Dashboard" component={Teacher2Dashboard} />
    </Stack.Navigator>
  );
}