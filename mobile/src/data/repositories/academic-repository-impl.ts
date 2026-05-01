import { api } from '@/core/api-client';

export interface AcademicSummaryResponse {
  child_id: string;
  pending_homework_count: number;
}

export interface PendingHomeworkItem {
  id: string;
  subject: string;
  title: string;
  description: string;
  status: 'pending' | 'submitted' | 'overdue';
  created_at?: string;
  child_id?: number;
}

export const AcademicRepository = {
  async getAcademicSummary(childId: string): Promise<AcademicSummaryResponse> {
    const response = await api.get('/dashboard/academic-summary', { params: { childId } });
    return response.data;
  },

  async getPendingHomework(childId?: string): Promise<PendingHomeworkItem[]> {
    const response = await api.get('/homeworks/');
    const allItems = Array.isArray(response.data)
      ? (response.data as PendingHomeworkItem[])
      : [];

    const normalizedChildId = childId ? Number(childId) : NaN;

    return allItems.filter((item) => {
      const isPending = item.status === 'pending' || item.status === 'overdue';
      if (!isPending) {
        return false;
      }

      if (Number.isNaN(normalizedChildId)) {
        return true;
      }

      return item.child_id === normalizedChildId;
    });
  },
};
