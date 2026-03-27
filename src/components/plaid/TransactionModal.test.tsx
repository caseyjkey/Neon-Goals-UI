import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
});
