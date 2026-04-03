/**
 * Attendance domain contracts — Issue #297 / #298 / #299 / #301 / #302 / #303
 */

export interface ChildSummary {
    id: string;
    name: string;
    grade: string;
    rollNo: string;
    presentDays: number;
    absentDays: number;
    totalDays: number;
    overallAttendance: number;   // e.g. 93.3 (%)
    monthlyAttendance: number;
    status: string;              // e.g. "Present Today"
    statusColor: string;         // hex colour
    emoji: string;
}

export interface CalendarDay {
    day: number;
    status: 'present' | 'absent' | 'leave' | 'holiday' | 'not-marked';
}

export interface MonthSummary {
    present: number;
    absent: number;
    leave: number;
    holiday: number;
    notMarked: number;
}

export interface LeaveHistoryItem {
    id: string;
    dateRange: string;
    days: number;
    reason: string;
    status: string;
    appliedDate: string;
    teacherNote?: string;
    reviewedBy?: string;   // Teacher name, populated after review
    submittedBy?: string;  // Parent name for audit trail
}

export interface AttendanceCalendarData {
    monthSummary: MonthSummary;
    days: CalendarDay[];
    leaveHistory: LeaveHistoryItem[];
}

export interface LeaveRequestInput {
    childId: string;
    startDate: string;  // YYYY-MM-DD
    endDate: string;    // YYYY-MM-DD
    reason: string;
}

export interface AttendanceRepository {
    getParentChildren(): Promise<ChildSummary[]>;
    getChildCalendar(childId: string, month?: string): Promise<AttendanceCalendarData>;
    getLeaveHistory(childId: string): Promise<LeaveHistoryItem[]>;
    applyLeave(input: LeaveRequestInput): Promise<LeaveHistoryItem>;
}
