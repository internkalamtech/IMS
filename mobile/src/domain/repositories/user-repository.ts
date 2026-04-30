export interface DashboardData {
  role: string;
  stats: { label: string; value: string | number }[];
  recentActivity?: { id: string; title: string; time: string }[];
}

export interface CreateUserInput {
  name: string;
  email: string;
}

export interface ClassData {
    id: number;
    name: string;
    section: string;
    academicPeriodId: number;
}

export interface UserRepository {
feature/student-profile-ui
  getDashboardData(role: string): Promise<DashboardData>;
  createUser(userData: CreateUserInput): Promise<void>;
    getDashboardData(role: string): Promise<DashboardData>;
    getClasses(): Promise<ClassData[]>;
 main
}