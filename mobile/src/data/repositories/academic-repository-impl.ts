import { api } from '@/core/api-client';

export interface AcademicSummaryResponse {
  child_id: string;
  pending_homework_count: number;
}

export const AcademicRepository = {
  async getAcademicSummary(childId: string): Promise<AcademicSummaryResponse> {
    const response = await api.get('/dashboard/academic-summary', { params: { childId } });
    return response.data;
  },
};
