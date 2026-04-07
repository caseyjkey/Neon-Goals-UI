import type { PlaidAccount } from '@/services/plaidService';

const LEGACY_DEMO_ACCOUNT_IDS = new Set([
  'demo-checking-1',
  'demo-savings-1',
  'demo-brokerage-1',
  'demo-roth-1',
  'demo-credit-1',
  'demo-401k-1',
  'demo-student-1',
]);

export const isLegacyFrontendDemoPlaidAccount = (account: PlaidAccount): boolean => (
  LEGACY_DEMO_ACCOUNT_IDS.has(account.id) ||
  account.plaidAccountId.startsWith('demo-plaid-')
);

export const sanitizePersistedPlaidAccounts = (accounts: PlaidAccount[]): PlaidAccount[] =>
  accounts.filter((account) => !isLegacyFrontendDemoPlaidAccount(account));
