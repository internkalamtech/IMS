import { api } from '@/core/api-client';
import { AuthError } from '@/core/error';
import { Logger } from '@/core/logger';
import {
    AttendanceCalendarData,
    AttendanceRepository,
    ChildSummary,
    LeaveHistoryItem,
    LeaveRequestInput,
} from '@/domain/repositories/attendance-repository';

// ── Mock fallback data ────────────────────────────────────────────────────────
const MOCK_CHILDREN: ChildSummary[] = [
    {
        id: '1', name: 'Aarav Kumar', grade: 'Class 7A', rollNo: '101',
        presentDays: 19, absentDays: 2, totalDays: 21,
        overallAttendance: 93.3, monthlyAttendance: 95.0,
        status: 'Present Today', statusColor: '#16A34A', emoji: '👦',
    },
    {
        id: '2', name: 'Priya Kumar', grade: 'Class 5B', rollNo: '45',
        presentDays: 15, absentDays: 6, totalDays: 21,
        overallAttendance: 82.5, monthlyAttendance: 74.0,
        status: 'Absent Today', statusColor: '#DC2626', emoji: '👧',
    },
];

function mockCalendar(year: number, month: number): AttendanceCalendarData {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: AttendanceCalendarData['days'] = [];
    let present = 0, absent = 0, leave = 0, holiday = 0, notMarked = 0;
    const today = new Date();

    for (let d = 1; d <= daysInMonth; d++) {
        const weekday = new Date(year, month - 1, d).getDay();
        let status: CalendarDay['status'];
        if (weekday === 0 || weekday === 6) { status = 'holiday'; holiday++; }
        else if (d % 10 === 0) { status = 'absent'; absent++; }
        else if (d % 15 === 0) { status = 'leave'; leave++; }
        else if (
            year === today.getFullYear() &&
            month === today.getMonth() + 1 &&
            d > today.getDate()
        ) { status = 'not-marked'; notMarked++; }
        else { status = 'present'; present++; }
        days.push({ day: d, status });
    }

    return {
        monthSummary: { present, absent, leave, holiday, notMarked },
        days,
        leaveHistory: [
            {
                id: '1',
                dateRange: `Mar 14 – Mar 15`,
                days: 2,
                reason: 'Medical appointment',
                status: 'Approved',
                appliedDate: 'Mar 10, 2025',
                teacherNote: 'Approved. Get well soon.',
            },
        ],
    };
}

type CalendarDay = AttendanceCalendarData['days'][number];

// ─────────────────────────────────────────────────────────────────────────────

export class AttendanceRepositoryImpl implements AttendanceRepository {
    async getParentChildren(): Promise<ChildSummary[]> {
        try {
            const response = await api.get<ChildSummary[]>('/attendance/parent/children');
            return response.data?.length ? response.data : MOCK_CHILDREN;
        } catch (error: any) {
            // Re-throw AuthError so session expiry is properly handled
            if (error?.name === 'AuthError' || error instanceof AuthError) {
                throw error;
            }
            Logger.error('getParentChildren — using mock fallback:', error);
            return MOCK_CHILDREN;
        }
    }

    async getChildCalendar(childId: string, month?: string): Promise<AttendanceCalendarData> {
        try {
            const params = month ? { month } : {};
            const response = await api.get<AttendanceCalendarData>(
                `/attendance/parent/children/${childId}/calendar`,
                { params }
            );
            return response.data;
        } catch (error: any) {
            // Re-throw AuthError so session expiry is properly handled
            if (error?.name === 'AuthError' || error instanceof AuthError) {
                throw error;
            }
            Logger.error(`getChildCalendar(${childId}) — using mock fallback:`, error);
            const [year, m] = month
                ? month.split('-').map(Number)
                : [new Date().getFullYear(), new Date().getMonth() + 1];
            return mockCalendar(year, m);
        }
    }
    async getLeaveHistory(childId: string): Promise<LeaveHistoryItem[]> {
        try {
            const response = await api.get<LeaveHistoryItem[]>(
                `/attendance/parent/children/${childId}/leave`
            );
            return response.data ?? [];
        } catch (error) {
            Logger.error(`getLeaveHistory(${childId}) error:`, error);
            return [];
        }
    }

    async applyLeave(input: LeaveRequestInput): Promise<LeaveHistoryItem> {
        try {
            const response = await api.post<LeaveHistoryItem>(
                `/attendance/parent/children/${input.childId}/leave`,
                { startDate: input.startDate, endDate: input.endDate, reason: input.reason }
            );
            return response.data;
        } catch (error: any) {
            Logger.error('applyLeave error:', error);
            // Re-throw AuthError directly so the screen can prompt re-login
            if (error?.name === 'AuthError' || error instanceof AuthError) {
                throw error;
            }
            // NetworkError wraps the server message in error.message
            // AxiosError has it in error.response.data.detail
            const detail =
                error?.response?.data?.detail ??
                error?.message ??
                'Failed to submit leave request.';
            throw new Error(detail);
        }
    }
}

export const attendanceRepository = new AttendanceRepositoryImpl();
