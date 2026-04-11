import { useAuth } from '@/presentation/hooks/useAuth';
import LoginScreen from '../LoginScreen';
import AdminDashboard from './AdminDashboard';
import ParentDashboard from './ParentDashboard';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import DriverDashboard from './DriverDashboard';
import TransportDashboard from './TransportDashboard';

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
        case 'transport':
            return <TransportDashboard />;
        default:
            return <LoginScreen />;
    }
}
