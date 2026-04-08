import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="home" size={22} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="alerts"
                options={{
                    title: 'Alerts',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="notifications" size={22} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="person" size={22} color={color} />
                    ),
                }}
            />

            {/* ✅ ADD THIS (4th TAB) */}
            <Tabs.Screen
                name="homework"
                options={{
                    title: 'Homework',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="book" size={22} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}