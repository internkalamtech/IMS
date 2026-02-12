export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'student' | 'teacher' | 'parent';
    avatarUrl?: string;
}
