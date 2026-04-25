"""
mobile/src/presentation/screens/AdminFinanceDashboard.tsx
PHASE_3: Admin Finance Dashboard
"""

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import financeAdminService from '../../data/services/financeAdminService';

export const AdminFinanceDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [budgetsData, expensesData] = await Promise.all([
        financeAdminService.listBudgets('2024-2025'),
        financeAdminService.listExpenses(),
      ]);
      setBudgets(budgetsData);
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error loading finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.totalBudget, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.totalSpent, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pending').length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Finance Dashboard</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Budget</Text>
          <Text style={styles.cardValue}>₹{totalBudget.toLocaleString()}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Spent</Text>
          <Text style={[styles.cardValue, { color: '#ff9800' }]}>
            ₹{totalSpent.toLocaleString()}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Remaining</Text>
          <Text style={[styles.cardValue, { color: '#4CAF50' }]}>
            ₹{(totalBudget - totalSpent).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Pending Approvals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Approvals</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>{pendingExpenses} expenses awaiting approval</Text>
          <TouchableOpacity style={styles.reviewBtn}>
            <Text style={styles.reviewBtnText}>Review Expenses →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Budget Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Budget Breakdown</Text>
        {budgets.map((budget) => (
          <View key={budget.id} style={styles.budgetItem}>
            <Text style={styles.departmentName}>{budget.department}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      (budget.totalSpent / budget.totalBudget) * 100,
                      100
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.budgetText}>
              ₹{budget.totalSpent} / ₹{budget.totalBudget}
            </Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>+ Add Budget</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>+ Log Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>View Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Reconcile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardsContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  section: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  reviewBtn: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  reviewBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  budgetItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  departmentName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  budgetText: {
    fontSize: 12,
    color: '#666',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default AdminFinanceDashboard;
