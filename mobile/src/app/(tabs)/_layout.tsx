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
                tabBarInactiveTintColor: '#A0A0A0',
                tabBarStyle: {
                    backgroundColor: theme.colors.card,
                    borderTopColor: theme.colors.border,
                    elevation: 0,
                    shadowOpacity: 0,
                    height: 65,
                    paddingBottom: 5,
                    paddingTop: 5,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    textAlign: 'center',
                },
                tabBarLabelPosition: 'below-icon', // ✅ forces text below icon
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'home' : 'home-outline'}
                            size={26}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="alerts"
                options={{
                    title: 'Alerts',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'notifications' : 'notifications-outline'}
                            size={26}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="homework"
                options={{
                    title: 'Homework',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'book' : 'book-outline'}
                            size={26}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'person' : 'person-outline'}
                            size={26}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}