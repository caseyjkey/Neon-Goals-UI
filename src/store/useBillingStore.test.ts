import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getEntitlements: vi.fn(),
  createCheckoutSession: vi.fn(),
  createCustomerPortalSession: vi.fn(),
  isBillingEnabled: vi.fn(),
}));

vi.mock('@/services/billingService', () => ({
  billingService: {
    getEntitlements: mocks.getEntitlements,
    createCheckoutSession: mocks.createCheckoutSession,
    createCustomerPortalSession: mocks.createCustomerPortalSession,
  },
  isBillingEnabled: mocks.isBillingEnabled,
}));

import { useBillingStore } from './useBillingStore';

describe('useBillingStore', () => {
  beforeEach(() => {
    mocks.getEntitlements.mockReset();
    mocks.createCheckoutSession.mockReset();
    mocks.createCustomerPortalSession.mockReset();
    mocks.isBillingEnabled.mockReset();
    useBillingStore.setState({
      entitlements: {
        monthlyMessageLimit: 100,
        modelsAllowed: ['gpt-standard'],
        scrapePriority: 'normal',
        maxEmailAlerts: 0,
        maxSmsAlerts: 0,
        apiAccess: false,
        openClawAccess: false,
      },
      usage: {
        messagesUsed: 0,
        monthlyMessageLimit: 100,
        emailAlertsUsed: 0,
        smsAlertsUsed: 0,
      },
      subscription: {
        plan: 'free',
        status: 'free',
      },
      isLoading: false,
      upgradeModal: {
        isOpen: false,
        context: null,
      },
    });
  });

  it('does not call billing endpoints when billing is disabled', async () => {
    mocks.isBillingEnabled.mockReturnValue(false);

    await useBillingStore.getState().fetchBilling();

    expect(mocks.getEntitlements).not.toHaveBeenCalled();
  });
});
