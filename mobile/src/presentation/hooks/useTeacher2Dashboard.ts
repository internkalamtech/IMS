import { useEffect, useState } from "react";
import { Teacher2DashboardRepositoryImpl, TeacherDashboardData } from "@/data/repositories/Teacher2DashboardRepositoryImpl";

export const useTeacher2Dashboard = () => {
    const repo = new Teacher2DashboardRepositoryImpl();

    const [data, setData] = useState<TeacherDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboard = async () => {
        try {
            const res = await repo.getDashboardData();
            setData(res);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            const res = await repo.getDashboardData();
            setData(res);
        } catch (err) {
            console.error("Refresh error:", err);
        } finally {
            setRefreshing(false);
        }
    };

    return {
        data,
        loading,
        refreshing,
        onRefresh,
    };
};