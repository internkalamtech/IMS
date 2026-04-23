/**
 * feeStructureService.ts
 * STORY_FEE_STRUCTURE_CRUD - Service layer for Fee Structure API calls
 */

import { api } from '../../../core/api/axiosInstance';

export interface FeeHead {
  name: string;
  amount: number;
}

export interface Installment {
  dueDate: string;
  amount: number;
  installmentNumber: number;
}

export interface FeeStructurePayload {
  className: string;
  academicYear: string;
  feeHeads: FeeHead[];
  installmentPlans: Installment[];
}

export interface FeeStructure extends FeeStructurePayload {
  id: string;
  totalAmount: number;
  createdAt: string;
  updatedAt?: string;
}

class FeeStructureService {
  private baseUrl = '/api/v1/fee-structures';

  /**
   * Fetch all fee structures for the current organization
   * Supports filtering by class name and academic year
   */
  async list(filters?: { className?: string; academicYear?: string }) {
    try {
      const response = await api.get<FeeStructure[]>(this.baseUrl, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching fee structures:', error);
      throw error;
    }
  }

  /**
   * Fetch a specific fee structure by ID
   */
  async getById(id: string) {
    try {
      const response = await api.get<FeeStructure>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fee structure:', error);
      throw error;
    }
  }

  /**
   * Create a new fee structure
   * Validates:
   * - Class name and academic year are provided
   * - At least one fee head is defined
   * - Total amount is calculated correctly
   */
  async create(payload: FeeStructurePayload) {
    try {
      // Calculate total amount from fee heads
      const totalAmount = payload.feeHeads.reduce((sum, head) => sum + head.amount, 0);

      const response = await api.post<FeeStructure>(this.baseUrl, {
        ...payload,
        totalAmount,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating fee structure:', error);
      throw error;
    }
  }

  /**
   * Update an existing fee structure
   * Validates that the updated structure doesn't conflict with student records
   */
  async update(id: string, payload: FeeStructurePayload) {
    try {
      // Calculate total amount from fee heads
      const totalAmount = payload.feeHeads.reduce((sum, head) => sum + head.amount, 0);

      const response = await api.put<FeeStructure>(`${this.baseUrl}/${id}`, {
        ...payload,
        totalAmount,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating fee structure:', error);
      throw error;
    }
  }

  /**
   * Delete a fee structure
   * Ensures data integrity with student records
   */
  async delete(id: string) {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting fee structure:', error);
      throw error;
    }
  }

  /**
   * Validate fee structure uniqueness
   * Checks if a fee structure with the same class and academic year already exists
   */
  async validateUniqueness(className: string, academicYear: string, excludeId?: string) {
    try {
      const response = await api.post<{ isUnique: boolean }>(
        `${this.baseUrl}/validate/uniqueness`,
        { className, academicYear, excludeId }
      );
      return response.data.isUnique;
    } catch (error) {
      console.error('Error validating fee structure uniqueness:', error);
      throw error;
    }
  }
}

export const feeStructureService = new FeeStructureService();
