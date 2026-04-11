import { UserRepositoryImpl } from '@/data/repositories/user-repository-impl';
import { DashboardData } from '@/domain/repositories/user-repository';
import { GetDashboardDataUseCase } from '@/domain/usecases/get-dashboard-data-usecase';
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

const userRepository = new UserRepositoryImpl();
const getDashboardDataUseCase = new GetDashboardDataUseCase(userRepository);

export function useDashboard(childId?: string) {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        let mounted = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const dashboardData = await getDashboardDataUseCase.execute(user.role, childId);
                if (mounted) setData(dashboardData);
            } catch (e) {
                if (mounted) setError('Failed to load dashboard data');
                console.error(e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [user, childId]);

    const onRefresh = async () => {
        setRefreshing(true);
        setError(null);
        try {
            const dashboardData = await getDashboardDataUseCase.execute(user!.role, childId);
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
        refresh: onRefresh,
        onRefresh
    };
}
