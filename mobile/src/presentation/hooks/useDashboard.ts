import { UserRepositoryImpl } from '@/data/repositories/user-repository-impl';
import { DashboardData } from '@/domain/repositories/user-repository';
import { GetDashboardDataUseCase } from '@/domain/usecases/get-dashboard-data-usecase';
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

const userRepository = new UserRepositoryImpl();
const getDashboardDataUseCase = new GetDashboardDataUseCase(userRepository);

export function useDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const dashboardData = await getDashboardDataUseCase.execute(user!.role);
            setData(dashboardData);
        } catch (e) {
            setError('Failed to load dashboard data');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        setError(null);
        try {
            const dashboardData = await getDashboardDataUseCase.execute(user!.role);
            setData(dashboardData);
        } catch (e) {
            setError('Failed to refresh dashboard data');
            console.error(e);
        } finally {
            setRefreshing(false);
        }
    };

    return {
        data,
        loading,
        refreshing,
        error,
        refresh: fetchData,
        onRefresh
    };
}
