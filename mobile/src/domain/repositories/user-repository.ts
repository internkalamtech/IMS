export interface DashboardData {
    role: string;
    stats: { label: string; value: string | number }[];
    recentActivity?: { id: string; title: string; time: string }[];
}

export interface ClassData {
    id: number;
    name: string;
    section: string;
    academicPeriodId: number;
}

export interface UserRepository {
    getDashboardData(role: string): Promise<DashboardData>;
    createUser(name: string, email: string): Promise<any>;
    getClasses(): Promise<ClassData[]>;
}
