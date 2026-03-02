import { create } from 'zustand';
import type { User, Settings } from '@/types/goals';
import { authService } from '@/services/authService';

// Read initial state from useAppStore's localStorage
// This keeps the slice in sync with the main store during the migration
const getInitialState = () => {
  try {
    const stored = localStorage.getItem('goals-af-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed?.state?.user ?? null,
        isDemoMode: parsed?.state?.isDemoMode ?? false,
        settings: parsed?.state?.settings ?? { theme: 'miami-vice', chatModel: 'gpt-4', displayName: 'User' },
      };
    }
  } catch (e) {
    console.error('Failed to parse stored auth state:', e);
  }
  return {
    user: null,
    isDemoMode: false,
    settings: { theme: 'miami-vice', chatModel: 'gpt-4', displayName: 'User' } as Settings,
  };
};

interface AuthState {
  user: User | null;
  settings: Settings;
  isDemoMode: boolean;
  setUser: (user: User | null) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  logout: () => void;
  setDemoMode: (enabled: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  // Initial state from localStorage (synced with useAppStore)
  ...getInitialState(),

  // Actions
  setUser: (user) => set({ user }),

  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings },
  })),

  logout: () => {
    authService.logout();
    set({ user: null, isDemoMode: false });
  },

  setDemoMode: (isDemoMode) => set({ isDemoMode }),
}));
