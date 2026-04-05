export interface ChildSummary {
    id: string;
    name: string;
    className?: string;
    rollNumber?: string;
}

export interface DashboardData {
    role: string;
    stats: { label: string; value: string | number }[];
    recentActivity?: { id: string; title: string; time: string }[];
    children?: ChildSummary[];
    selectedChildId?: string;
}

export interface UserRepository {
    getDashboardData(role: string): Promise<DashboardData>;
}
