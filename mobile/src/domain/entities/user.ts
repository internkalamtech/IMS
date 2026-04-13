export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student' | 'teacher' | 'driver' | 'parent';
  avatarUrl?: string;
}
