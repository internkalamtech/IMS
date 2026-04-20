export type UserRole = 'admin' | 'student' | 'teacher' | 'parent' | 'transport' | 'driver';

export interface User {
    attendance: number;
    marks: number;
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
}
