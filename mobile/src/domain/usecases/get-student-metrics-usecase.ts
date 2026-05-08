import { User } from '../entities/user';

export interface StudentMetrics {
  totalStudents: number;
  avgMarks: number;
  avgAttendance: number;
}

export function getStudentMetricsUsecase(user: User[]): StudentMetrics {
  if (!user.length) {
    return {
      totalStudents: 0,
      avgMarks: 0,
      avgAttendance: 0,
    };
  }

  const totalStudents = user.length;

  const totalMarks = user.reduce((sum, u) => sum + u.marks, 0);
  const totalAttendance = user.reduce((sum, u) => sum + (u.attendance || 0), 0);

  return {
    totalStudents,
    avgMarks: Number((totalMarks / totalStudents).toFixed(1)),
    avgAttendance: Number((totalAttendance / totalStudents).toFixed(1)),
  };
}