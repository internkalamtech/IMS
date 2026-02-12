import { useAuth } from '@/presentation/hooks/useAuth';
import LoginScreen from '@/presentation/screens/LoginScreen';
import AdminDashboard from '@/presentation/screens/dashboards/AdminDashboard';
import ParentDashboard from '@/presentation/screens/dashboards/ParentDashboard';
import StudentDashboard from '@/presentation/screens/dashboards/StudentDashboard';
import TeacherDashboard from '@/presentation/screens/dashboards/TeacherDashboard';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0066FF" />
            </View>
        );
    }

    if (!user) {
        return <LoginScreen />;
    }

    switch (user.role) {
        case 'admin':
            return <AdminDashboard />;
        case 'teacher':
            return <TeacherDashboard />;
        case 'parent':
            return <ParentDashboard />;
        case 'student':
            return <StudentDashboard />;
        default:
            return <LoginScreen />;
    }
}
