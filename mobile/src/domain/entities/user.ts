export type UserRole =
    | 'admin'
    | 'student'
    | 'teacher'
    | 'parent'
    | 'transport'
    | 'driver';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
}
