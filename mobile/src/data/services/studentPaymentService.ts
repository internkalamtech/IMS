/**
 * studentPaymentService.ts
 * STORY_STUDENT_FEE_CRUD - Service layer for Student Payment API calls
 */

import { api } from '../../../core/api/axiosInstance';

export interface Payment {
  id: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Cheque' | 'Bank Transfer';
  receiptNumber: string;
  paidDate: string;
  referenceNumber?: string;
  notes?: string;
}

export interface StudentPaymentPayload {
  amount: number;
  paymentMode: string;
  referenceNumber?: string;
  notes?: string;
}

export interface StudentPayment {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  className: string;
  totalFeeAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'Paid' | 'Partial' | 'Overdue';
  nextDueDate: string;
  paymentHistory: Payment[];
}

export interface StudentPaymentFilters {
  studentName?: string;
  rollNumber?: string;
  className?: string;
  status?: 'Paid' | 'Partial' | 'Overdue';
  skip?: number;
  limit?: number;
}

class StudentPaymentService {
  private baseUrl = '/api/v1/student-payments';

  /**
   * Fetch all student payment records
   * Supports filtering and pagination
   */
  async list(filters?: StudentPaymentFilters) {
    try {
      const response = await api.get<StudentPayment[]>(this.baseUrl, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching student payments:', error);
      throw error;
    }
  }

  /**
   * Fetch a specific student's payment record
   */
  async getById(studentId: string) {
    try {
      const response = await api.get<StudentPayment>(`${this.baseUrl}/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student payment:', error);
      throw error;
    }
  }

  /**
   * Record a new payment for a student
   * Automatically:
   * - Generates receipt number
   * - Recalculates balance
   * - Updates payment status
   * - Stores in ledger
   */
  async recordPayment(studentId: string, payload: StudentPaymentPayload) {
    try {
      const response = await api.post<Payment>(
        `${this.baseUrl}/${studentId}/record-payment`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }

  /**
   * Get payment history for a student
   */
  async getPaymentHistory(studentId: string, skip: number = 0, limit: number = 50) {
    try {
      const response = await api.get<{ payments: Payment[]; total: number }>(
        `${this.baseUrl}/${studentId}/history`,
        { params: { skip, limit } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  /**
   * Search students by name, roll number, or class
   */
  async searchStudents(query: string) {
    try {
      const response = await api.get<StudentPayment[]>(
        `${this.baseUrl}/search`,
        { params: { q: query } }
      );
      return response.data;
    } catch (error) {
      console.error('Error searching students:', error);
      throw error;
    }
  }

  /**
   * Get students filtered by payment status
   */
  async getByStatus(status: 'Paid' | 'Partial' | 'Overdue', skip?: number, limit?: number) {
    try {
      const response = await api.get<StudentPayment[]>(`${this.baseUrl}/status/${status}`, {
        params: { skip, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching students by status:', error);
      throw error;
    }
  }

  /**
   * Get students with overdue payments
   */
  async getOverdueStudents() {
    try {
      const response = await api.get<StudentPayment[]>(
        `${this.baseUrl}/status/Overdue`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching overdue students:', error);
      throw error;
    }
  }

  /**
   * Download receipt for a specific payment
   */
  async downloadReceipt(studentId: string, receiptNumber: string) {
    try {
      const response = await api.get(
        `${this.baseUrl}/${studentId}/receipt/${receiptNumber}`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error downloading receipt:', error);
      throw error;
    }
  }

  /**
   * Update payment status manually (admin override)
   */
  async updatePaymentStatus(studentId: string, status: string) {
    try {
      const response = await api.put<StudentPayment>(
        `${this.baseUrl}/${studentId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  /**
   * Generate payment receipt
   */
  async generateReceipt(studentId: string, paymentId: string) {
    try {
      const response = await api.post(
        `${this.baseUrl}/${studentId}/generate-receipt`,
        { paymentId }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating receipt:', error);
      throw error;
    }
  }

  /**
   * Bulk record payments for multiple students
   */
  async bulkRecordPayments(
    payments: Array<{ studentId: string; payload: StudentPaymentPayload }>
  ) {
    try {
      const response = await api.post(
        `${this.baseUrl}/bulk-record`,
        { payments }
      );
      return response.data;
    } catch (error) {
      console.error('Error recording bulk payments:', error);
      throw error;
    }
  }
}

export const studentPaymentService = new StudentPaymentService();
