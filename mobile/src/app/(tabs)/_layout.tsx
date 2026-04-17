import { useTheme } from '@/core/theme/ThemeContext';
import { useAuth } from '@/presentation/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const isDriver = user?.role === 'driver';

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: '#8E8E93',
                tabBarStyle: {
                    backgroundColor: theme.colors.card,
                    borderTopColor: theme.colors.border,
                    elevation: 0,
                    shadowOpacity: 0,
                    height: 60,
                    paddingBottom: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                }
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="alerts"
                options={{
                    title: 'Alerts',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={24} color={color} />
                    ),
                    href: isDriver ? null : undefined,
                }}
            />
            <Tabs.Screen
                name="compliance"
                options={{
                    title: 'Compliance',
                    href: isDriver ? undefined : null,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="maintenance"
                options={{
                    title: 'Maintenance',
                    href: isDriver ? undefined : null,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'build' : 'build-outline'} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
