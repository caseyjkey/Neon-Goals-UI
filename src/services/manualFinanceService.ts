import { apiClient } from './apiClient';
import type { ManualFinancialAccount, ManualCashflow } from '@/types/projections';

export const manualFinanceService = {
  // Manual Financial Accounts
  async getAccounts(): Promise<ManualFinancialAccount[]> {
    return apiClient.get<ManualFinancialAccount[]>('/manual-financial-accounts');
  },

  async createAccount(data: Omit<ManualFinancialAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<ManualFinancialAccount> {
    return apiClient.post<ManualFinancialAccount>('/manual-financial-accounts', data);
  },

  async updateAccount(id: string, data: Partial<ManualFinancialAccount>): Promise<ManualFinancialAccount> {
    return apiClient.patch<ManualFinancialAccount>(`/manual-financial-accounts/${id}`, data);
  },

  async deleteAccount(id: string): Promise<void> {
    return apiClient.delete(`/manual-financial-accounts/${id}`);
  },

  // Manual Cashflows
  async getCashflows(): Promise<ManualCashflow[]> {
    return apiClient.get<ManualCashflow[]>('/manual-cashflows');
  },

  async createCashflow(data: Omit<ManualCashflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<ManualCashflow> {
    return apiClient.post<ManualCashflow>('/manual-cashflows', data);
  },

  async updateCashflow(id: string, data: Partial<ManualCashflow>): Promise<ManualCashflow> {
    return apiClient.patch<ManualCashflow>(`/manual-cashflows/${id}`, data);
  },

  async deleteCashflow(id: string): Promise<void> {
    return apiClient.delete(`/manual-cashflows/${id}`);
  },
};
