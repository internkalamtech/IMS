"""
mobile/src/data/services/allPortalServices.ts
PHASE 4-7: All Frontend Services for Parent, Student, Teacher, Transport Portals
"""

import axios from 'axios';

const API = 'http://localhost:8000/api/v1';

// PARENT PORTAL SERVICES
export class ParentAcademicService {
  async getStudentMarks(studentId: string, year: string) {
    return (await axios.get(`${API}/academics/${studentId}?year=${year}`)).data;
  }
  async getPerformanceAnalytics(studentId: string) {
    return (await axios.get(`${API}/analytics/${studentId}`)).data;
  }
}

export class ParentAttendanceService {
  async getAttendanceCalendar(studentId: string, month: string) {
    return (await axios.get(`${API}/attendance/${studentId}?month=${month}`)).data;
  }
  async submitLeaveRequest(studentId: string, data: any) {
    return (await axios.post(`${API}/leave-requests`, { student_id: studentId, ...data })).data;
  }
}

export class ParentConductService {
  async getConductRecords(studentId: string) {
    return (await axios.get(`${API}/conduct/${studentId}`)).data;
  }
}

export class ParentExamService {
  async getExamSchedule(studentId: string) {
    return (await axios.get(`${API}/exams/${studentId}`)).data;
  }
  async getResults(studentId: string) {
    return (await axios.get(`${API}/results/${studentId}`)).data;
  }
}

export class ParentTransportService {
  async getBusSchedule(studentId: string) {
    return (await axios.get(`${API}/transport/schedule/${studentId}`)).data;
  }
  async getRealTimeLocation(vehicleId: string) {
    return (await axios.get(`${API}/transport/location/${vehicleId}`)).data;
  }
}

// STUDENT PORTAL SERVICE
export class StudentDashboardService {
  async getDashboardData(studentId: string) {
    return (await axios.get(`${API}/student/dashboard/${studentId}`)).data;
  }
  async submitAssignment(studentId: string, assignmentId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return (await axios.post(`${API}/assignments/${assignmentId}/submit`, formData)).data;
  }
}

// TEACHER PORTAL SERVICES
export class TeacherAcademicService {
  async getClassList(classId: string) {
    return (await axios.get(`${API}/teacher/classes/${classId}/students`)).data;
  }
  async bulkEnterMarks(classId: string, marks: any[]) {
    return (await axios.post(`${API}/teacher/marks/bulk`, { class_id: classId, marks })).data;
  }
  async createAssignment(data: any) {
    return (await axios.post(`${API}/teacher/assignments`, data)).data;
  }
}

export class TeacherAssessmentService {
  async createQuestionBank(questions: any[]) {
    return (await axios.post(`${API}/teacher/questions`, questions)).data;
  }
  async createTest(testData: any) {
    return (await axios.post(`${API}/teacher/tests`, testData)).data;
  }
  async autoScoreTest(testId: string, responses: any) {
    return (await axios.post(`${API}/teacher/tests/${testId}/score`, responses)).data;
  }
}

export class TeacherLeaveService {
  async submitLeaveRequest(leaveData: any) {
    return (await axios.post(`${API}/teacher/leaves`, leaveData)).data;
  }
  async getLeaveBalance(teacherId: string, year: string) {
    return (await axios.get(`${API}/teacher/leaves/balance?year=${year}`)).data;
  }
}

export class TeacherTimetableService {
  async getPersonalTimetable(teacherId: string) {
    return (await axios.get(`${API}/teacher/timetable/${teacherId}`)).data;
  }
}

// TRANSPORT MANAGEMENT SERVICES
export class VehicleService {
  async getVehicleDocuments(vehicleId: string) {
    return (await axios.get(`${API}/transport/vehicles/${vehicleId}/documents`)).data;
  }
  async updateComplianceRecord(vehicleId: string, checklist: any) {
    return (await axios.put(`${API}/transport/vehicles/${vehicleId}/compliance`, checklist)).data;
  }
}

export class RouteService {
  async createRoute(routeData: any) {
    return (await axios.post(`${API}/transport/routes`, routeData)).data;
  }
  async optimizeRoute(constraints: any) {
    return (await axios.post(`${API}/transport/routes/optimize`, constraints)).data;
  }
  async calculateCost(routeId: string) {
    return (await axios.get(`${API}/transport/routes/${routeId}/cost`)).data;
  }
}

export class DriverService {
  async verifyDriver(driverId: string) {
    return (await axios.get(`${API}/transport/drivers/${driverId}/verify`)).data;
  }
  async getDriverDocuments(driverId: string) {
    return (await axios.get(`${API}/transport/drivers/${driverId}/documents`)).data;
  }
}

// Export singletons
export const parentAcademic = new ParentAcademicService();
export const parentAttendance = new ParentAttendanceService();
export const parentConduct = new ParentConductService();
export const parentExam = new ParentExamService();
export const parentTransport = new ParentTransportService();
export const studentDashboard = new StudentDashboardService();
export const teacherAcademic = new TeacherAcademicService();
export const teacherAssessment = new TeacherAssessmentService();
export const teacherLeave = new TeacherLeaveService();
export const teacherTimetable = new TeacherTimetableService();
export const vehicle = new VehicleService();
export const route = new RouteService();
export const driver = new DriverService();
