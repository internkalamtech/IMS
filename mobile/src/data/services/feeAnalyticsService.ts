/**
 * feeAnalyticsService.ts
 * STORY_COLLECTION_ANALYTICS - Analytics service for dashboard
 */

import { api } from '../../../core/api/axiosInstance';

export interface DashboardStats {
  totalCollectible: number;
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  collectionPercentage: number;
  studentsCount: number;
  paidStudents: number;
  pendingStudents: number;
  overdueStudents: number;
}

export interface CollectionTrend {
  month: string;
  collected: number;
  target: number;
}

class FeeAnalyticsService {
  private baseUrl = '/api/v1/fee-analytics';

  async getDashboard() {
    try {
      const response = await api.get<{ stats: DashboardStats; trends: CollectionTrend[] }>(
        `${this.baseUrl}/dashboard`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  }

  async getCollectionStats(startDate?: string, endDate?: string) {
    try {
      const response = await api.get<DashboardStats>(
        `${this.baseUrl}/stats`,
        { params: { startDate, endDate } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching collection stats:', error);
      throw error;
    }
  }

  async getTrends(months: number = 12) {
    try {
      const response = await api.get<CollectionTrend[]>(
        `${this.baseUrl}/trends`,
        { params: { months } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching trends:', error);
      throw error;
    }
  }

  async downloadPaymentReport(format: 'pdf' | 'csv' | 'excel' = 'csv') {
    try {
      const response = await api.get(`${this.baseUrl}/export/payments`, {
        params: { format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading payment report:', error);
      throw error;
    }
  }

  async downloadOverdueList(format: 'pdf' | 'csv' = 'csv') {
    try {
      const response = await api.get(`${this.baseUrl}/export/overdue`, {
        params: { format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading overdue list:', error);
      throw error;
    }
  }
}

export const feeAnalyticsService = new FeeAnalyticsService();
