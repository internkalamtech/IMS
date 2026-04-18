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
<<<<<<< HEAD
    createUser(userData: CreateUserInput): Promise<void>;
}
=======
}
>>>>>>> 108e7a58ce795d7ea23ae909095c1d92aad03e60
