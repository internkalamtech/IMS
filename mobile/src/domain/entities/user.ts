export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'student' | 'teacher' | 'parent' | 'transport' | 'driver';
    avatarUrl?: string;
}
