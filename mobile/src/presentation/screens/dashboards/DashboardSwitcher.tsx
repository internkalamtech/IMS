import { useAuth } from '@/presentation/hooks/useAuth';
import LoginScreen from '../LoginScreen';
import AdminDashboard from './AdminDashboard';
import ParentDashboard from './ParentDashboard';
import StudentDashboard from './StudentDashboard';
import Teacher2Dashboard from './Teacher2Dashboard';
import DriverDashboard from './DriverDashboard';

export default function DashboardSwitcher() {
    const { user } = useAuth();

    if (!user) {
        return <LoginScreen />;
    }

    switch (user.role) {
        case 'admin':
            return <AdminDashboard />;
        case 'teacher':
            return <Teacher2Dashboard />; 
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