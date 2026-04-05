import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  resetUserScopedState: vi.fn(),
  logoutMock: vi.fn(),
  getProfileMock: vi.fn(),
  initializeAuthMock: vi.fn(),
  updateSettingsMock: vi.fn(),
}));

vi.mock('./useAppStore', () => ({
  useAppStore: {
    getState: () => ({ resetUserScopedState: mocks.resetUserScopedState }),
  },
}));

vi.mock('@/services/authService', () => ({
  authService: {
    logout: mocks.logoutMock,
    getProfile: mocks.getProfileMock,
    initializeAuth: mocks.initializeAuthMock,
  },
}));

vi.mock('@/services/usersService', () => ({
  usersService: {
    updateSettings: mocks.updateSettingsMock,
  },
}));

import { useAuthStore } from './useAuthStore';

describe('useAuthStore identity transitions', () => {
  beforeEach(() => {
    mocks.logoutMock.mockReset();
    mocks.getProfileMock.mockReset();
    mocks.initializeAuthMock.mockReset();
    mocks.updateSettingsMock.mockReset();
    mocks.resetUserScopedState.mockReset();
    useAuthStore.setState({
      user: {
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
      },
      isDemoMode: true,
      isLoading: false,
      error: 'stale',
    });
  });

  it('logout clears the app store reset boundary', () => {
    useAuthStore.getState().logout();

    expect(mocks.logoutMock).toHaveBeenCalledTimes(1);
    expect(mocks.resetUserScopedState).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isDemoMode).toBe(false);
    expect(useAuthStore.getState().error).toBeNull();
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('initializeApp without a token clears stale state', async () => {
    mocks.initializeAuthMock.mockReturnValue(null);

    await useAuthStore.getState().initializeApp();

    expect(mocks.initializeAuthMock).toHaveBeenCalledTimes(1);
    expect(mocks.resetUserScopedState).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isDemoMode).toBe(false);
  });
});
