import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const plaidMocks = vi.hoisted(() => ({
  getStoredTransactions: vi.fn(),
  getTransactions: vi.fn(),
  getBalance: vi.fn(),
}));

vi.mock('@/services/plaidService', () => ({
  plaidService: {
    getStoredTransactions: plaidMocks.getStoredTransactions,
    getTransactions: plaidMocks.getTransactions,
    getBalance: plaidMocks.getBalance,
  },
}));

import { TransactionModal } from './TransactionModal';

const account = {
  id: 'acct_1',
  plaidAccountId: 'plaid_1',
  institutionName: 'Capital One',
  accountName: 'Checking',
  accountType: 'depository' as const,
  accountSubtype: 'checking',
  currentBalance: 1200,
  currency: 'USD',
};

describe('TransactionModal', () => {
  beforeEach(() => {
    plaidMocks.getStoredTransactions.mockReset();
    plaidMocks.getTransactions.mockReset();
    plaidMocks.getBalance.mockReset();
  });

  it('loads stored transactions and surfaces fetch errors instead of showing an empty state', async () => {
    plaidMocks.getStoredTransactions.mockRejectedValueOnce(new Error('boom'));
    plaidMocks.getBalance.mockResolvedValueOnce({ balance: 1200 });

    render(
      <TransactionModal
        account={account}
        isOpen
        onClose={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Could not load transaction history')).toBeInTheDocument();
    });

    expect(plaidMocks.getStoredTransactions).toHaveBeenCalledWith('acct_1');
    expect(plaidMocks.getTransactions).not.toHaveBeenCalled();
    expect(screen.queryByText('No stored transactions')).not.toBeInTheDocument();
    expect(screen.getByText(/follow-up fetch for the account failed/i)).toBeInTheDocument();
  });

  it('shows a direction-specific drilldown header and filters to highlighted rows', async () => {
    plaidMocks.getStoredTransactions.mockResolvedValueOnce([
      {
        id: 'txn_pay_1',
        accountId: 'acct_1',
        name: '100-SFDC INC',
        amount: -3047.02,
        date: '2026-02-24T00:00:00.000Z',
        category: ['OTHER'],
        pending: false,
        merchantName: '100-SFDC INC',
        paymentChannel: 'other',
      },
      {
        id: 'txn_other_1',
        accountId: 'acct_1',
        name: 'Coffee Shop',
        amount: 14.25,
        date: '2026-02-25T00:00:00.000Z',
        category: ['FOOD'],
        pending: false,
        merchantName: 'Coffee Shop',
        paymentChannel: 'in_store',
      },
    ]);
    plaidMocks.getBalance.mockResolvedValueOnce({ balance: 1200 });

    render(
      <TransactionModal
        account={account}
        isOpen
        onClose={vi.fn()}
        highlightTransactionIds={['txn_pay_1']}
        highlightedItemLabel="100 Sfdc Inc"
        highlightedItemDirection="income"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Recent Income')).toBeInTheDocument();
    });

    expect(screen.getByText('100-SFDC INC')).toBeInTheDocument();
    expect(screen.queryByText('Coffee Shop')).not.toBeInTheDocument();
    expect(screen.getByText('+$3,047.02')).toBeInTheDocument();
  });

  it('prefills recurring cashflow creation from a transaction row and allows unmerge from drilldown', async () => {
    const onAddManualCashflow = vi.fn();
    const onUnmergeRecurringSource = vi.fn();

    plaidMocks.getStoredTransactions.mockResolvedValueOnce([
      {
        id: 'txn_pay_1',
        accountId: 'acct_1',
        name: '100-SFDC INC',
        amount: -3047.02,
        date: '2026-02-24T00:00:00.000Z',
        category: ['OTHER'],
        pending: false,
        merchantName: '100-SFDC INC',
        paymentChannel: 'other',
      },
    ]);
    plaidMocks.getBalance.mockResolvedValueOnce({ balance: 1200 });

    render(
      <TransactionModal
        account={account}
        isOpen
        onClose={vi.fn()}
        onAddManualCashflow={onAddManualCashflow}
        highlightTransactionIds={['txn_pay_1']}
        highlightedItemLabel="100 Sfdc Inc"
        highlightedItemDirection="income"
        mergedSources={[
          {
            id: 'income:acct_2:bonus',
            label: 'Bonus',
            accountName: 'Rewards Card',
            sourceTransactionIds: ['txn_bonus_1'],
          },
        ]}
        onUnmergeRecurringSource={onUnmergeRecurringSource}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Recent Income')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Add recurring from 100-SFDC INC/i }));
    expect(onAddManualCashflow).toHaveBeenCalledWith({
      label: '100-SFDC INC',
      amount: 3047.02,
      type: 'income',
      category: 'OTHER',
    });

    fireEvent.click(screen.getByRole('button', { name: /Remove merged source Bonus/i }));
    expect(onUnmergeRecurringSource).toHaveBeenCalledWith('income:acct_2:bonus');
  });
});
