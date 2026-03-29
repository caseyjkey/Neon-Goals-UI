import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlaidLinkOnSuccess } from 'react-plaid-link';

const mocks = vi.hoisted(() => ({
  createLinkToken: vi.fn(),
  linkAccount: vi.fn(),
  fetchPlaidAccounts: vi.fn(),
  addPlaidAccounts: vi.fn(),
  removePlaidAccount: vi.fn(),
  syncPlaidAccount: vi.fn(),
  fetchOverview: vi.fn(),
  fetchCashflow: vi.fn(),
  fetchGoalForecasts: vi.fn(),
  capturedOnSuccess: null as PlaidLinkOnSuccess | null,
}));

vi.mock('react-plaid-link', () => ({
  usePlaidLink: (config: { onSuccess: PlaidLinkOnSuccess }) => {
    mocks.capturedOnSuccess = config.onSuccess;
    return { open: vi.fn(), ready: true };
  },
}));

vi.mock('@/services/plaidService', () => ({
  plaidService: {
    createLinkToken: mocks.createLinkToken,
    linkAccount: mocks.linkAccount,
  },
}));

vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: () => ({
    isDemoMode: false,
  }),
}));

vi.mock('@/store/useFinanceStore', () => ({
  useFinanceStore: () => ({
    plaidAccounts: [],
    fetchPlaidAccounts: mocks.fetchPlaidAccounts,
    addPlaidAccounts: mocks.addPlaidAccounts,
    removePlaidAccount: mocks.removePlaidAccount,
    syncPlaidAccount: mocks.syncPlaidAccount,
  }),
}));

vi.mock('@/store/useProjectionStore', () => ({
  useProjectionStore: (selector: (state: unknown) => unknown) =>
    selector({
      fetchOverview: mocks.fetchOverview,
      fetchCashflow: mocks.fetchCashflow,
      fetchGoalForecasts: mocks.fetchGoalForecasts,
    }),
}));

import { usePlaid } from './usePlaidLink';

describe('usePlaid link success', () => {
  beforeEach(() => {
    mocks.capturedOnSuccess = null;
    mocks.createLinkToken.mockReset();
    mocks.linkAccount.mockReset();
    mocks.fetchPlaidAccounts.mockReset();
    mocks.addPlaidAccounts.mockReset();
    mocks.removePlaidAccount.mockReset();
    mocks.syncPlaidAccount.mockReset();
    mocks.fetchOverview.mockReset();
    mocks.fetchCashflow.mockReset();
    mocks.fetchGoalForecasts.mockReset();
  });

  it('refreshes projection data after linking accounts', async () => {
    mocks.linkAccount.mockResolvedValue({
      accounts: [
        {
          id: 'acct_1',
          plaidAccountId: 'plaid_1',
          accountName: 'Checking',
          accountType: 'depository',
          accountSubtype: 'checking',
          currentBalance: 1200,
          currency: 'USD',
          institutionName: 'Capital One',
        },
      ],
    });

    renderHook(() => usePlaid());

    expect(mocks.capturedOnSuccess).toBeTruthy();

    await act(async () => {
      await mocks.capturedOnSuccess?.('public-token', {
        institution: { name: 'Capital One', institution_id: 'ins_1' },
        accounts: [],
        link_session_id: 'session_1',
        status: null,
        account: {} as any,
        account_id: null,
        transfer_status: null,
        wallet: null,
        add_card: null,
        public_token: 'public-token',
      } as any);
    });

    expect(mocks.addPlaidAccounts).toHaveBeenCalledTimes(1);
    expect(mocks.fetchOverview).toHaveBeenCalledTimes(1);
    expect(mocks.fetchCashflow).toHaveBeenCalledTimes(1);
    expect(mocks.fetchGoalForecasts).toHaveBeenCalledTimes(1);
  });
});
