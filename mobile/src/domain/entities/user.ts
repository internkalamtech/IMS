export type UserRole = 'admin' | 'student' | 'teacher' | 'parent' | 'transport';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
}
