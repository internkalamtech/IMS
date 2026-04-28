export interface ClassData {
    id: number;
    name: string;
    section: string;
    academicPeriodId: number;
    teacherUserId: number | null;
    teacherName?: string | null;
    subject?: string | null;
    totalStudents: number;
}

export interface DashboardData {
    role: string;
    stats: { label: string; value: string | number }[];
    recentActivity?: { id: string; title: string; time: string }[];
}

export interface UserRepository {
    getDashboardData(role: string): Promise<DashboardData>;
    getClasses(): Promise<ClassData[]>;
}
