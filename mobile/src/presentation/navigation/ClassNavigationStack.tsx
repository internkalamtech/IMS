"""
mobile/src/presentation/navigation/ClassNavigationStack.tsx
Navigation routes for class management screens
"""

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClassManagementScreen from '../screens/ClassManagementScreen';
import { ClassListScreen } from '../screens/ClassListScreen';
import { ClassEditScreen } from '../screens/ClassEditScreen';

const Stack = createNativeStackNavigator();

export type ClassStackParamList = {
  ClassManagement: undefined;
  ClassList: undefined;
  ClassEdit: { classId: string };
};

export const ClassNavigationStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="ClassManagement"
        component={ClassManagementScreen}
        options={{
          title: 'Class Management',
        }}
      />
      <Stack.Screen
        name="ClassList"
        component={ClassListScreen}
        options={{
          title: 'Classes',
        }}
      />
      <Stack.Screen
        name="ClassEdit"
        component={ClassEditScreen}
        options={{
          title: 'Edit Class',
        }}
      />
    </Stack.Navigator>
  );
};

export default ClassNavigationStack;
