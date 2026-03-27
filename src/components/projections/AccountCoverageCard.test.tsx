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

  it('does not render standalone add buttons anymore', () => {
    render(<AccountCoverageCard />);

    expect(screen.queryByRole('button', { name: 'Link Account' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Manual Cashflow' })).not.toBeInTheDocument();
  });
});
