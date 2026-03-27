import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const openPlaidLink = vi.fn();
const syncAccount = vi.fn();
const removeAccount = vi.fn();
const fetchAccounts = vi.fn();

vi.mock('@/store/useGoalsStore', () => ({
  useGoalsStore: () => ({ goals: [] }),
}));

vi.mock('@/store/useFinanceStore', () => ({
  useFinanceStore: () => ({ syncFinanceGoal: vi.fn() }),
}));

vi.mock('@/store/useProjectionStore', () => ({
  useProjectionStore: (selector: (state: unknown) => unknown) =>
    selector({
      fetchOverview: vi.fn(),
      fetchCashflow: vi.fn(),
      fetchGoalForecasts: vi.fn(),
      fetchManualAccounts: vi.fn(),
      fetchManualCashflows: vi.fn(),
    }),
}));

vi.mock('@/hooks/usePlaidLink', () => ({
  usePlaid: () => ({
    open: openPlaidLink,
    ready: true,
    isLoading: false,
    error: null,
    accounts: [
      {
        id: 'acct_1',
        plaidAccountId: 'plaid_1',
        accountName: 'Checking',
        accountType: 'depository',
        accountSubtype: 'checking',
        currentBalance: 1200,
        currency: 'USD',
        mask: '1234',
        institutionName: 'Capital One',
      },
    ],
    pendingAccounts: [],
    fetchAccounts,
    syncAccount,
    removeAccount,
    isSyncing: null,
  }),
}));

vi.mock('@/components/projections/ProjectionHero', () => ({
  ProjectionHero: () => <div>ProjectionHero</div>,
}));

vi.mock('@/components/projections/ProjectionChartCard', () => ({
  ProjectionChartCard: () => <div>ProjectionChartCard</div>,
}));

vi.mock('@/components/projections/GoalForecastCard', () => ({
  GoalForecastCard: () => <div>GoalForecastCard</div>,
}));

vi.mock('@/components/projections/RecurringCashflowCard', () => ({
  RecurringCashflowCard: () => <div>RecurringCashflowCard</div>,
}));

vi.mock('@/components/projections/ScenarioControls', () => ({
  ScenarioControls: () => <div>ScenarioControls</div>,
}));

vi.mock('@/components/projections/AccountCoverageCard', () => ({
  AccountCoverageCard: () => <div>AccountCoverageCard</div>,
}));

vi.mock('@/components/plaid/TransactionModal', () => ({
  TransactionModal: () => null,
}));

vi.mock('@/components/ui/SyncToast', () => ({
  SyncToast: () => null,
  useSyncToast: () => ({
    isVisible: false,
    status: 'idle',
    message: '',
    close: vi.fn(),
    showSyncing: vi.fn(),
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

vi.mock('@/services/finicityService', () => ({
  finicityService: {
    createConnectUrl: vi.fn(),
  },
}));

import { FinancialSummary } from './FinancialSummary';

describe('FinancialSummary add account modal', () => {
  beforeEach(() => {
    openPlaidLink.mockReset();
  });

  it('opens the shared add-account chooser from an account section plus button', () => {
    render(<FinancialSummary />);

    fireEvent.click(screen.getByRole('button', { name: 'Toggle accounts' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add Cash Accounts' }));

    expect(screen.getByRole('heading', { name: 'Add Account' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Link with Plaid/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Manual Account/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Manual Cashflow/ })).toBeInTheDocument();
  });
});
