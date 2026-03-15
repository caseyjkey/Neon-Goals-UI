import { apiClient } from './apiClient';
import type { Settings, User } from '@/types/goals';
import { API_BASE_URL } from '@/lib/apiConfig'; // Still used for GitHub OAuth URL

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface UserProfileResponse extends User {
  settings?: Settings;
}

export const authService = {
  async getGitHubAuthUrl() {
    // Return backend GitHub OAuth URL with /api/ prefix
    return `${API_BASE_URL}/api/auth/github`;
  },

  async login(token: string) {
    // Store token in localStorage
    localStorage.setItem('auth_token', token);
    apiClient.setToken(token);

    // Fetch user profile from backend using apiClient
    return apiClient.get<LoginResponse['user']>('/auth/me', true);
  },

  async demoLogin() {
    // Call backend demo endpoint to get a valid JWT token using apiClient
    const data = await apiClient.post<LoginResponse>('/auth/demo', undefined, false);

    // Store token in localStorage
    localStorage.setItem('auth_token', data.access_token);
    apiClient.setToken(data.access_token);

    return data.user;
  },

  async getProfile() {
    return apiClient.get<UserProfileResponse>('/auth/me');
  },

  logout() {
    apiClient.clearToken();
    localStorage.removeItem('auth_token');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  // Initialize auth on app load
  initializeAuth() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiClient.setToken(token);
    }
    return token;
  },

  // ============ Email/Password Authentication Methods ============

  /**
   * Register a new user with email and password
   * Returns verification info - user must verify email before logging in
   */
  async register(
    email: string,
    password: string,
    name: string
  ): Promise<{ message: string; userId: string; verificationToken?: string }> {
    return apiClient.post<{ message: string; userId: string; verificationToken?: string }>(
      '/auth/register',
      { email, password, name },
      false
    );
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<LoginResponse> {
    const data = await apiClient.post<LoginResponse>('/auth/verify-email', { token }, false);

    // Store token in localStorage
    localStorage.setItem('auth_token', data.access_token);
    apiClient.setToken(data.access_token);

    return data;
  },

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<{ message: string; verificationToken?: string }> {
    return apiClient.post<{ message: string; verificationToken?: string }>(
      '/auth/resend-verification',
      { email },
      false
    );
  },

  /**
   * Login with email and password
   */
  async loginWithEmail(email: string, password: string): Promise<LoginResponse> {
    const data = await apiClient.post<LoginResponse>('/auth/login', { email, password }, false);

    // Store token in localStorage
    localStorage.setItem('auth_token', data.access_token);
    apiClient.setToken(data.access_token);

    return data;
  },

  /**
   * Initiate password reset
   */
  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    return apiClient.post<{ message: string; resetToken?: string }>(
      '/auth/forgot-password',
      { email },
      false
    );
  },

  /**
   * Complete password reset
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      '/auth/reset-password',
      { token, newPassword },
      false
    );
  },
};
