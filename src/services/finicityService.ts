import { apiClient } from './apiClient';

export interface FinicityProbeResponse {
  customerId: string;
  connectUrl: string;
  institutionId?: number;
  usedTestingCustomer: boolean;
}

export const finicityService = {
  async getProbeStatus(): Promise<{ enabled: boolean }> {
    return apiClient.get('/finicity/probe/status');
  },

  async createConnectUrl(institutionId?: number): Promise<FinicityProbeResponse> {
    return apiClient.post('/finicity/probe/connect-url', {
      institutionId,
    });
  },
};
