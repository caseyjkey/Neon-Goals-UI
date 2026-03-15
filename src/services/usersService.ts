import { apiClient } from './apiClient';
import type { SettingsOptions } from '@/types/goals';

export const usersService = {
  async getProfile() {
    return apiClient.get('/users/me');
  },

  async updateSettings(settings: any) {
    return apiClient.patch('/users/me/settings', settings);
  },

  async getSettingsOptions() {
    return apiClient.get<SettingsOptions>('/users/me/settings/options');
  },
};
