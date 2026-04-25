"""
mobile/src/data/services/financeAdminService.ts
PHASE_3: Finance Admin Service
"""

import axios, { AxiosInstance } from 'axios';

interface Budget {
  id: string;
  academicYear: string;
  department: string;
  totalBudget: number;
  totalAllocated: number;
  totalSpent: number;
  remainingBudget: number;
  status: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  status: string;
  vendorName?: string;
  approvalDate?: string;
}

export class FinanceAdminService {
  private apiClient: AxiosInstance;
  private baseURL = 'http://localhost:8000/api/v1';

  constructor(apiClient?: AxiosInstance) {
    this.apiClient = apiClient || axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });
  }

  async createBudget(data: any): Promise<Budget> {
    try {
      const response = await this.apiClient.post<Budget>('/budgets', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to create budget');
    }
  }

  async listBudgets(academicYear?: string): Promise<Budget[]> {
    try {
      const params: any = {};
      if (academicYear) params.academic_year = academicYear;
      const response = await this.apiClient.get('/budgets', { params });
      return response.data.items || [];
    } catch (error) {
      throw this.handleError(error, 'Failed to list budgets');
    }
  }

  async approveBudget(budgetId: string): Promise<Budget> {
    try {
      const response = await this.apiClient.post<Budget>(`/budgets/${budgetId}/approve`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to approve budget');
    }
  }

  async createExpense(data: any): Promise<Expense> {
    try {
      const response = await this.apiClient.post<Expense>('/expenses', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to create expense');
    }
  }

  async listExpenses(status?: string): Promise<Expense[]> {
    try {
      const params: any = {};
      if (status) params.status = status;
      const response = await this.apiClient.get('/expenses', { params });
      return response.data.items || [];
    } catch (error) {
      throw this.handleError(error, 'Failed to list expenses');
    }
  }

  async approveExpense(expenseId: string): Promise<Expense> {
    try {
      const response = await this.apiClient.post<Expense>(`/expenses/${expenseId}/approve`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to approve expense');
    }
  }

  private handleError(error: any, defaultMessage: string): Error {
    if (axios.isAxiosError(error)) {
      return new Error(error.response?.data?.detail || defaultMessage);
    }
    return error as Error;
  }
}

export default new FinanceAdminService();
