import { useTheme } from '@/core/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
    const { theme } = useTheme();

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
            <Tabs.Screen
            name="timetable-classes"
            options={{
                href: null, // 🔥 hides from tab bar
            }}
        />

        <Tabs.Screen
            name="timetable"
            options={{
                href: null, // 🔥 hides from tab bar
            }}
        />

        <Tabs.Screen
            name="classes"
            options={{
                href: null, // optional if used
            }}
        />
        </Tabs>
    );
}
