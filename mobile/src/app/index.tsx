import TeacherDashboard from '@/presentation/dashboard/TeacherDashboard';
import { useTheme } from '@/core/theme/ThemeContext';
import { useAuth } from '@/presentation/hooks/useAuth';
import LoginScreen from '@/presentation/screens/LoginScreen';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
    const { user, loading } = useAuth();
    const { theme } = useTheme();

    if (loading) {
        return (
             <TeacherDashboard />
        );
    }

    if (!user) {
        return <LoginScreen />;
    }

    return <Redirect href="/(tabs)" />;
}
