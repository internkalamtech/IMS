"""
mobile/src/data/services/classService.ts
STORY_CLASS_LIST_API - Class Management Service
"""

import axios, { AxiosInstance } from 'axios';

interface ClassData {
  id: string;
  name: string;
  section: string;
  sectionName?: string;
  academicYear: string;
  classTeacherId?: string;
  classTeacherName?: string;
  maxStudents?: number;
  currentStudentCount: number;
  totalSubjects: number;
  status: 'active' | 'archived' | 'inactive';
  fullName: string;
  createdAt: string;
  updatedAt?: string;
}

interface ClassCreatePayload {
  name: string;
  section: string;
  sectionName?: string;
  academicYear: string;
  classTeacherId?: string;
  maxStudents?: number;
  subjects?: string[];
}

interface ClassUpdatePayload {
  name?: string;
  section?: string;
  sectionName?: string;
  classTeacherId?: string;
  maxStudents?: number;
  subjects?: string[];
}

interface ClassListResponse {
  total: number;
  page: number;
  pageSize: number;
  items: ClassData[];
}

export class ClassService {
  private apiClient: AxiosInstance;
  private baseURL = 'http://localhost:8000/api/v1';

  constructor(apiClient?: AxiosInstance) {
    this.apiClient = apiClient || axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create a new class
   */
  async createClass(payload: ClassCreatePayload): Promise<ClassData> {
    try {
      const response = await this.apiClient.post<ClassData>('/classes', payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to create class');
    }
  }

  /**
   * Get all classes with optional filtering
   */
  async listClasses(
    academicYear?: string,
    className?: string,
    skip: number = 0,
    limit: number = 50
  ): Promise<ClassListResponse> {
    try {
      const params: any = { skip, limit };
      if (academicYear) params.academic_year = academicYear;
      if (className) params.class_name = className;

      const response = await this.apiClient.get<ClassListResponse>('/classes', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch classes');
    }
  }

  /**
   * Get a specific class by ID
   */
  async getClass(classId: string): Promise<ClassData> {
    try {
      const response = await this.apiClient.get<ClassData>(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch class');
    }
  }

  /**
   * Update a class
   */
  async updateClass(classId: string, payload: ClassUpdatePayload): Promise<ClassData> {
    try {
      const response = await this.apiClient.put<ClassData>(`/classes/${classId}`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to update class');
    }
  }

  /**
   * Delete a class
   */
  async deleteClass(classId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/classes/${classId}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to delete class');
    }
  }

  /**
   * Validate class uniqueness
   */
  async validateUniqueness(
    name: string,
    section: string,
    academicYear: string,
    excludeId?: string
  ): Promise<{ isValid: boolean; message?: string }> {
    try {
      const response = await this.apiClient.post('/classes/validate/uniqueness', {
        name,
        section,
        academic_year: academicYear,
        exclude_id: excludeId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to validate class');
    }
  }

  /**
   * Get classes by academic year
   */
  async getClassesByYear(academicYear: string): Promise<ClassData[]> {
    try {
      const response = await this.listClasses(academicYear);
      return response.items;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch classes by year');
    }
  }

  /**
   * Search classes by name
   */
  async searchClasses(query: string, academicYear?: string): Promise<ClassData[]> {
    try {
      const response = await this.listClasses(academicYear, query);
      return response.items;
    } catch (error) {
      throw this.handleError(error, 'Failed to search classes');
    }
  }

  /**
   * Get classes count
   */
  async getClassesCount(academicYear?: string): Promise<number> {
    try {
      const response = await this.listClasses(academicYear, undefined, 0, 1);
      return response.total;
    } catch (error) {
      throw this.handleError(error, 'Failed to count classes');
    }
  }

  private handleError(error: any, defaultMessage: string): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.detail || defaultMessage;

      if (status === 404) return new Error('Class not found');
      if (status === 409) return new Error('Class already exists');
      if (status === 401) return new Error('Unauthorized');
      if (status === 400) return new Error(message);

      return new Error(message || defaultMessage);
    }
    return error as Error;
  }
}

export default new ClassService();
