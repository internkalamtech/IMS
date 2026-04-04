import { useState, useEffect, useCallback } from 'react';
import { api } from '@/core/api-client';
import { useAuth } from './useAuth';

export interface FeeSummary {
  student_id: string;
  total_fee: number;
  paid_amount: number;
  balance_due: number;
  next_due_date: string | null;
  status_percentage: number;
}

export interface Installment {
  id: string;
  fee_structure_id: string;
  student_id: string;
  due_date: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Overdue';
  paid_date?: string;
}

export interface Transaction {
  id: string;
  student_id: string;
  installment_id: string | null;
  amount: number;
  payment_mode: 'UPI' | 'Card' | 'Cash' | 'Check' | 'Online';
  transaction_ref: string;
  receipt_number: string;
  created_at: string;
  description?: string;
}

interface UseFeeDataResult {
  feeSummary: FeeSummary | null;
  installments: Installment[];
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch student fee data including summary, installments, and transactions
 * @param studentId - The student ID to fetch data for
 * @returns Object containing fee data and loading states
 */
export const useFeeData = (studentId: string): UseFeeDataResult => {
  const { user } = useAuth();
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeeData = useCallback(async () => {
    if (!studentId) {
      setError('Student ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch fee summary
      const summaryResponse = await api.get(
        `/finance/student/${studentId}/fee-summary`
      );
      setFeeSummary(summaryResponse.data);

      // Fetch installments
      const installmentsResponse = await api.get(
        `/finance/student/${studentId}/installments`
      );
      setInstallments(installmentsResponse.data);

      // Fetch transactions/receipts
      const transactionsResponse = await api.get(
        `/finance/student/${studentId}/receipts`,
        { params: { limit: 50, offset: 0 } }
      );
      setTransactions(transactionsResponse.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch fee data';
      setError(errorMessage);
      console.error('Error fetching fee data:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchFeeData();
  }, [fetchFeeData]);

  const refetch = async () => {
    await fetchFeeData();
  };

  return {
    feeSummary,
    installments,
    transactions,
    loading,
    error,
    refetch,
  };
};
