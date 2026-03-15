import { create } from 'zustand';
import type {
  ProjectionOverview,
  CashflowSummary,
  ProjectionScenarioResult,
  ScenarioInputs,
  ManualFinancialAccount,
  ManualCashflow,
  ProjectionHorizon,
  GoalForecast,
} from '@/types/projections';
import { projectionsService } from '@/services/projectionsService';
import { manualFinanceService } from '@/services/manualFinanceService';

const DEFAULT_SCENARIO_INPUTS: ScenarioInputs = {
  monthlySavingsIncrease: 0,
  diningReduction: 0,
  subscriptionReduction: 0,
  incomeAdjustment: 0,
  excludedGoalId: null,
};

interface ProjectionState {
  // Data
  overview: ProjectionOverview | null;
  cashflow: CashflowSummary | null;
  goalForecasts: GoalForecast[];
  scenario: ProjectionScenarioResult | null;
  manualAccounts: ManualFinancialAccount[];
  manualCashflows: ManualCashflow[];

  // UI state
  selectedHorizon: ProjectionHorizon;
  scenarioInputs: ScenarioInputs;
  isLoadingOverview: boolean;
  isLoadingCashflow: boolean;
  isLoadingScenario: boolean;
  isLoadingManual: boolean;
  error: string | null;

  // Actions
  setHorizon: (horizon: ProjectionHorizon) => void;
  setScenarioInputs: (inputs: Partial<ScenarioInputs>) => void;
  resetScenario: () => void;

  fetchOverview: () => Promise<void>;
  fetchCashflow: () => Promise<void>;
  fetchGoalForecasts: () => Promise<void>;
  runScenario: () => Promise<void>;

  fetchManualAccounts: () => Promise<void>;
  addManualAccount: (data: Omit<ManualFinancialAccount, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  removeManualAccount: (id: string) => Promise<void>;

  fetchManualCashflows: () => Promise<void>;
  addManualCashflow: (data: Omit<ManualCashflow, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  removeManualCashflow: (id: string) => Promise<void>;
}

export const useProjectionStore = create<ProjectionState>()((set, get) => ({
  overview: null,
  cashflow: null,
  goalForecasts: [],
  scenario: null,
  manualAccounts: [],
  manualCashflows: [],
  selectedHorizon: 12,
  scenarioInputs: { ...DEFAULT_SCENARIO_INPUTS },
  isLoadingOverview: false,
  isLoadingCashflow: false,
  isLoadingScenario: false,
  isLoadingManual: false,
  error: null,

  setHorizon: (horizon) => {
    set({ selectedHorizon: horizon });
    // Re-fetch with new horizon
    get().fetchOverview();
    get().fetchGoalForecasts();
  },

  setScenarioInputs: (inputs) => {
    set((state) => ({
      scenarioInputs: { ...state.scenarioInputs, ...inputs },
    }));
  },

  resetScenario: () => {
    set({ scenarioInputs: { ...DEFAULT_SCENARIO_INPUTS }, scenario: null });
  },

  fetchOverview: async () => {
    set({ isLoadingOverview: true, error: null });
    try {
      const overview = await projectionsService.getOverview(get().selectedHorizon);
      set({ overview, isLoadingOverview: false });
    } catch (err) {
      console.error('[useProjectionStore] Failed to fetch overview:', err);
      set({ isLoadingOverview: false, error: 'Could not load projections' });
    }
  },

  fetchCashflow: async () => {
    set({ isLoadingCashflow: true });
    try {
      const cashflow = await projectionsService.getCashflow();
      set({ cashflow, isLoadingCashflow: false });
    } catch (err) {
      console.error('[useProjectionStore] Failed to fetch cashflow:', err);
      set({ isLoadingCashflow: false });
    }
  },

  fetchGoalForecasts: async () => {
    try {
      const goalForecasts = await projectionsService.getForecast(get().selectedHorizon);
      set({ goalForecasts });
    } catch (err) {
      console.error('[useProjectionStore] Failed to fetch goal forecasts:', err);
    }
  },

  runScenario: async () => {
    set({ isLoadingScenario: true });
    try {
      const scenario = await projectionsService.runScenario(
        get().scenarioInputs,
        get().selectedHorizon
      );
      set({ scenario, isLoadingScenario: false });
    } catch (err) {
      console.error('[useProjectionStore] Failed to run scenario:', err);
      set({ isLoadingScenario: false, error: 'Scenario failed' });
    }
  },

  fetchManualAccounts: async () => {
    set({ isLoadingManual: true });
    try {
      const manualAccounts = await manualFinanceService.getAccounts();
      set({ manualAccounts, isLoadingManual: false });
    } catch (err) {
      console.error('[useProjectionStore] Failed to fetch manual accounts:', err);
      set({ isLoadingManual: false });
    }
  },

  addManualAccount: async (data) => {
    try {
      const account = await manualFinanceService.createAccount(data);
      set((state) => ({ manualAccounts: [...state.manualAccounts, account] }));
      // Refresh projections after adding coverage
      get().fetchOverview();
    } catch (err) {
      console.error('[useProjectionStore] Failed to add manual account:', err);
      throw err;
    }
  },

  removeManualAccount: async (id) => {
    try {
      await manualFinanceService.deleteAccount(id);
      set((state) => ({
        manualAccounts: state.manualAccounts.filter((a) => a.id !== id),
      }));
      get().fetchOverview();
    } catch (err) {
      console.error('[useProjectionStore] Failed to remove manual account:', err);
      throw err;
    }
  },

  fetchManualCashflows: async () => {
    try {
      const manualCashflows = await manualFinanceService.getCashflows();
      set({ manualCashflows });
    } catch (err) {
      console.error('[useProjectionStore] Failed to fetch manual cashflows:', err);
    }
  },

  addManualCashflow: async (data) => {
    try {
      const cashflow = await manualFinanceService.createCashflow(data);
      set((state) => ({ manualCashflows: [...state.manualCashflows, cashflow] }));
      get().fetchCashflow();
      get().fetchOverview();
    } catch (err) {
      console.error('[useProjectionStore] Failed to add manual cashflow:', err);
      throw err;
    }
  },

  removeManualCashflow: async (id) => {
    try {
      await manualFinanceService.deleteCashflow(id);
      set((state) => ({
        manualCashflows: state.manualCashflows.filter((c) => c.id !== id),
      }));
      get().fetchCashflow();
      get().fetchOverview();
    } catch (err) {
      console.error('[useProjectionStore] Failed to remove manual cashflow:', err);
      throw err;
    }
  },
}));
