import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { CashflowSummary, RecurringItem } from '@/types/projections';

const recurringIncome: RecurringItem[] = [
  {
    id: 'income_1',
    label: 'Paycheck',
    amount: 3000,
    cadence: 'monthly',
    confidence: 'high',
    source: 'linked',
    accountId: 'acct_1',
    accountName: 'Everyday Checking',
    sourceTransactionIds: ['txn_1', 'txn_2'],
  },
  {
    id: 'income_2',
    label: 'Bonus',
    amount: 900,
    cadence: 'monthly',
    confidence: 'medium',
    source: 'linked',
    accountId: 'acct_2',
    accountName: 'Rewards Card',
    sourceTransactionIds: ['txn_3', 'txn_4'],
  },
];

const cashflow: CashflowSummary = {
  totalMonthlyIncome: 3000,
  totalMonthlyExpenses: 1200,
  netMonthlyCashflow: 1800,
  recurringIncome,
  recurringExpenses: [],
};

vi.mock('@/store/useProjectionStore', () => ({
  useProjectionStore: (selector: (state: unknown) => unknown) =>
    selector({
      cashflow,
      isLoadingCashflow: false,
    }),
}));

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

import { RecurringCashflowCard } from './RecurringCashflowCard';

describe('RecurringCashflowCard', () => {
  it('shows the linked account name and emits item selection for drilldown', () => {
    const onSelectItem = vi.fn();

    render(<RecurringCashflowCard onSelectItem={onSelectItem} />);

    expect(screen.getByText('Everyday Checking')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Paycheck/i }));

    expect(onSelectItem).toHaveBeenCalledWith(recurringIncome[0], 'income');
  });

  it('opens manual cashflow creation from the header plus button', () => {
    const onAddManualCashflow = vi.fn();

    render(<RecurringCashflowCard onAddManualCashflow={onAddManualCashflow} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add recurring cashflow' }));

    expect(onAddManualCashflow).toHaveBeenCalled();
  });

  it('merges recurring items by drag and drop', () => {
    const onMergeItems = vi.fn();

    render(<RecurringCashflowCard onMergeItems={onMergeItems} />);

    const source = screen.getByRole('button', { name: /Bonus/i });
    const target = screen.getByRole('button', { name: /Paycheck/i });

    fireEvent.dragStart(source);
    fireEvent.dragOver(target);
    fireEvent.drop(target);

    expect(onMergeItems).toHaveBeenCalledWith(recurringIncome[1], recurringIncome[0], 'income');
  });
});
