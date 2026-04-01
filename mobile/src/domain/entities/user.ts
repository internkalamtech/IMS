export interface User {
    attendance: number;
    marks: number;
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'student' | 'teacher' | 'parent';
    avatarUrl?: string;
}
