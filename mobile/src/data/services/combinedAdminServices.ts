"""
mobile/src/data/services/timetableService.ts
mobile/src/data/services/userManagementService.ts
PHASE_3: Frontend Services for Timetable & User Management
"""

import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

export class TimetableService {
  async createTimetable(classId: string, slots: any[]): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE}/timetables`, {
        class_id: classId,
        time_slots: slots,
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to create timetable');
    }
  }

  async detectConflicts(timetableId: string): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE}/timetables/${timetableId}/conflicts`);
      return response.data.conflicts || [];
    } catch (error) {
      throw new Error('Failed to detect conflicts');
    }
  }

  async approveTimetable(timetableId: string): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE}/timetables/${timetableId}/approve`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to approve timetable');
    }
  }
}

export class UserManagementService {
  async createUser(userData: any): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE}/users`, userData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create user');
    }
  }

  async bulkImportUsers(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${API_BASE}/users/bulk-import`, formData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to bulk import users');
    }
  }

  async getUser(userId: string): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE}/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch user');
    }
  }

  async assignRoles(userId: string, roles: string[]): Promise<any> {
    try {
      const response = await axios.put(`${API_BASE}/users/${userId}/roles`, { roles });
      return response.data;
    } catch (error) {
      throw new Error('Failed to assign roles');
    }
  }
}

export const timetableService = new TimetableService();
export const userManagementService = new UserManagementService();
