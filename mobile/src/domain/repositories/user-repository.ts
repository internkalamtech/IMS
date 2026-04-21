export interface DashboardData {
  role: string;
  stats: { label: string; value: string | number }[];
  recentActivity?: { id: string; title: string; time: string }[];
}

export interface CreateUserInput {
  name: string;
  email: string;
}

export interface UserRepository {
  getDashboardData(role: string): Promise<DashboardData>;
  createUser(userData: CreateUserInput): Promise<void>;
}