import { useAuth } from '@/presentation/hooks/useAuth';
import LoginScreen from '../LoginScreen';
import AdminDashboard from './AdminDashboard';
import DriverDashboard from './DriverDashboard';
import ParentDashboard from './ParentDashboard';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';

export default function DashboardSwitcher() {
    const { user } = useAuth();

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
        case 'driver':
            return <DriverDashboard />;
        default:
            return <LoginScreen />;
    }
}
