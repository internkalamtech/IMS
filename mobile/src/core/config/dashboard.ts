import { ColorPalettes } from '@/core/theme/tokens';

export interface QuickAction {
    id: number;
    title: string;
    icon: string;
    color: string;
    route?: string; // Future proofing for navigation
}

export const DASHBOARD_CONFIG = {
    admin: {
        quickActions: [
            { id: 1, title: 'Manage Users', icon: 'people', color: ColorPalettes.blue[500], route: '/add-user' },
            { id: 2, title: 'Manage Classes', icon: 'school', color: ColorPalettes.emerald[500], route: '/manage-classes' },
            { id: 3, title: 'Timetable', icon: 'calendar', color: ColorPalettes.indigo[500] },
            { id: 4, title: 'Fee Management', icon: 'cash', color: ColorPalettes.amber[500] },
            { id: 5, title: 'Assign Teachers', icon: 'person-add', color: ColorPalettes.purple[500] },
            { id: 6, title: 'Assessments', icon: 'medal', color: ColorPalettes.yellow[500] },
        ] as QuickAction[],
    },
    teacher: {
        quickActions: [
            { id: 1, title: 'Attendance', icon: 'checkbox', color: ColorPalettes.emerald[500] },
            { id: 2, title: 'Homework', icon: 'book', color: ColorPalettes.blue[500] },
            { id: 3, title: 'Results', icon: 'school', color: ColorPalettes.amber[500] },
            { id: 4, title: 'Leaves', icon: 'document-text', color: ColorPalettes.purple[500] },
            { id: 5, title: 'Schedule', icon: 'calendar', color: ColorPalettes.indigo[500] },
            { id: 6, title: 'Messages', icon: 'chatbubbles', color: ColorPalettes.pink[500] },
        ] as QuickAction[],
    },
    student: {
        quickActions: [
            { id: 1, title: 'Timetable', icon: 'calendar', color: ColorPalettes.blue[500] },
            { id: 2, title: 'Results', icon: 'school', color: ColorPalettes.amber[500] },
            { id: 3, title: 'Homework', icon: 'book', color: ColorPalettes.emerald[500] },
            { id: 4, title: 'Library', icon: 'library', color: ColorPalettes.purple[500] },
            { id: 5, title: 'Attendance', icon: 'checkmark-circle', color: ColorPalettes.cyan[500] },
            { id: 6, title: 'Profile', icon: 'person', color: ColorPalettes.indigo[500] },
        ] as QuickAction[],
    },
    parent: {
        quickActions: [
            { id: 1, title: 'Timetable', icon: 'calendar', color: ColorPalettes.blue[500] },
            { id: 2, title: 'Attendance', icon: 'checkmark-circle', color: ColorPalettes.emerald[500] },
            { id: 3, title: 'Academics', icon: 'book', color: ColorPalettes.purple[500] },
            { id: 4, title: 'Fees', icon: 'cash', color: ColorPalettes.emerald[500] }, // Keeping original color for now, even if amber seems better for cash
            { id: 5, title: 'Transport', icon: 'bus', color: ColorPalettes.amber[500] },
            { id: 6, title: 'Exams', icon: 'document-text', color: ColorPalettes.red[500] },
            { id: 7, title: 'Conduct', icon: 'alert-circle', color: ColorPalettes.amber[500] },
        ] as QuickAction[],
    },
    driver: {
        quickActions: [
            { id: 1, title: 'Report Incident', icon: 'warning', color: ColorPalettes.red[500] },
            { id: 2, title: 'My Incidents', icon: 'list', color: ColorPalettes.blue[500] },
            { id: 3, title: 'My Route', icon: 'map', color: ColorPalettes.emerald[500] },
            { id: 4, title: 'Schedule', icon: 'calendar', color: ColorPalettes.indigo[500] },
        ] as QuickAction[],
    },
};
