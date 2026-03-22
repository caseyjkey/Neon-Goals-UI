import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const plaidOpen = vi.fn();

vi.mock('@/hooks/usePlaidLink', () => ({
  usePlaid: () => ({
    accounts: [],
    open: plaidOpen,
    isLoading: false,
  }),
}));

vi.mock('@/store/useProjectionStore', () => ({
  useProjectionStore: (selector: (state: unknown) => unknown) =>
    selector({
      overview: null,
      manualAccounts: [],
      manualCashflows: [],
      removeManualAccount: vi.fn(),
      removeManualCashflow: vi.fn(),
    }),
}));

vi.mock('@/services/finicityService', () => ({
  finicityService: {
    createConnectUrl: vi.fn(),
  },
}));

import { AccountCoverageCard } from './AccountCoverageCard';

describe('AccountCoverageCard account chooser', () => {
  beforeEach(() => {
    plaidOpen.mockReset();
  });

  it('opens an account source dialog from the link account button', () => {
    render(<AccountCoverageCard />);

    fireEvent.click(screen.getByRole('button', { name: 'Link Account' }));

    expect(screen.getByRole('heading', { name: 'Add Account' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Link with Plaid/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Manual Account/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Manual Account' })).not.toBeInTheDocument();
  });
});
