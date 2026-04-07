import { describe, expect, it } from 'vitest';
import { sanitizePersistedPlaidAccounts } from './sanitizePlaidAccounts';

describe('sanitizePersistedPlaidAccounts', () => {
  it('removes legacy frontend demo placeholder accounts from persisted state', () => {
    const sanitized = sanitizePersistedPlaidAccounts([
      {
        id: 'demo-checking-1',
        plaidAccountId: 'demo-plaid-checking-1',
        institutionName: 'Chase',
        accountName: 'Everyday Checking',
        accountType: 'depository',
        accountSubtype: 'checking',
        currentBalance: 4823.47,
        currency: 'USD',
        mask: '1234',
      },
      {
        id: 'real-db-id',
        plaidAccountId: 'demo-account-id',
        institutionName: 'Demo Bank',
        accountName: 'Demo Checking',
        accountType: 'depository',
        accountSubtype: 'checking',
        currentBalance: 5000,
        currency: 'USD',
        mask: '1234',
      },
    ]);

    expect(sanitized).toHaveLength(1);
    expect(sanitized[0]?.id).toBe('real-db-id');
  });
});
