export interface DashboardData {
    role: string;
    stats: { label: string; value: string | number }[];
    recentActivity?: { id: string; title: string; time: string }[];
}

export interface UserRepository {
    getDashboardData(role: string): Promise<DashboardData>;
    createUser(name: string, email: string): Promise<any>;
}
