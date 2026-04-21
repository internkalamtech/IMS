import { StudentInfo } from '@/domain/entities/driver-workflow';
import { DriverDashboardData } from '@/domain/usecases/get-driver-dashboard-usecase';

export type DriverDashboardState =
    | { status: 'loading' }
    | { status: 'loaded'; data: DriverDashboardData }
    | { status: 'error'; message: string };

export type StudentsAtStopState =
    | { status: 'loading' }
    | { status: 'loaded'; data: StudentInfo[] }
    | { status: 'error'; message: string };
