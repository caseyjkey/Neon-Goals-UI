import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlaidAccount } from '@/services/plaidService';

interface PlaidAccountCardProps {
  account: PlaidAccount;
  onSync?: (accountId: string) => void;
  onClick?: (accountId: string) => void;
  isSyncing?: boolean;
}

// Default institution icons by name
const defaultIcons: Record<string, string> = {
  'capital one': '🏦',
  'schwab': '📊',
  'robinhood': '🪶',
  'ally': '🏠',
  'mohela': '🎓',
  'best buy': '🛒',
  'chase': '🔵',
  'bank of america': '🔴',
  'wells fargo': '🟡',
  'fidelity': '💚',
  'vanguard': '🚢',
  'td ameritrade': '📈',
  'coinbase': '🪙',
  'paypal': '💳',
  'venmo': '💸',
};

const getDefaultIcon = (institutionName: string): string => {
  const lowerName = institutionName.toLowerCase();
  for (const [key, icon] of Object.entries(defaultIcons)) {
    if (lowerName.includes(key)) return icon;
  }
  return '🏦';
};

const isDebtType = (type: string, subtype?: string): boolean => {
  const typeLower = type.toLowerCase();
  const subtypeLower = subtype?.toLowerCase() || '';
  return (
    ['credit', 'loan'].includes(typeLower) ||
    ['credit_card', 'auto', 'mortgage', 'student', 'loan'].includes(subtypeLower)
  );
};

// Account type display config - uses subtype when available, falls back to type
const getAccountTypeLabel = (type: string, subtype?: string): { label: string } => {
  const subtypeLower = subtype?.toLowerCase() || '';
  const typeLower = type.toLowerCase();

  // Check subtype first for more specific labels
  if (subtypeLower === 'checking') return { label: 'Checking' };
  if (subtypeLower === 'savings') return { label: 'Savings' };
  if (subtypeLower === 'credit_card') return { label: 'Credit' };
  if (subtypeLower === 'money_market') return { label: 'Money Market' };
  if (subtypeLower === 'cd') return { label: 'CD' };
  if (subtypeLower === 'ira' || subtypeLower === 'roth' || subtypeLower === '401k') return { label: 'Retirement' };
  if (subtypeLower === 'brokerage') return { label: 'Brokerage' };
  if (subtypeLower === 'auto') return { label: 'Auto Loan' };
  if (subtypeLower === 'mortgage') return { label: 'Mortgage' };
  if (subtypeLower === 'student') return { label: 'Student Loan' };

  // Fall back to type
  if (typeLower === 'depository') return { label: 'Bank' };
  if (typeLower === 'credit') return { label: 'Credit' };
  if (typeLower === 'investment') return { label: 'Investment' };
  if (typeLower === 'brokerage') return { label: 'Brokerage' };
  if (typeLower === 'loan') return { label: 'Loan' };

  return { label: 'Account' };
};

export const PlaidAccountCard: React.FC<PlaidAccountCardProps> = ({
  account,
  onSync,
  onClick,
  isSyncing = false,
}) => {
  const isDebt = account.isDebt || isDebtType(account.accountType, account.accountSubtype);
  const displayBalance = Math.abs(account.currentBalance);
  const icon = getDefaultIcon(account.institutionName);
  const typeConfig = getAccountTypeLabel(account.accountType, account.accountSubtype);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30 cursor-pointer transition-colors hover:bg-muted/50"
      onClick={() => onClick?.(account.id)}
    >
      {/* Institution Icon */}
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-lg">
        {icon}
      </div>

      {/* Account Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {account.accountName}
            {account.mask && <span className="text-muted-foreground"> ••{account.mask}</span>}
          </p>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted/50 text-foreground">
            {typeConfig.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {account.institutionName}
        </p>
      </div>

      {/* Sync Button */}
      {onSync && (
        <div className="relative rounded-lg">
          {isSyncing && (
            <div className="pointer-events-none absolute inset-0 rounded-lg overflow-hidden">
              <div className="absolute inset-[-80%] animate-spin bg-[conic-gradient(from_0deg,rgba(34,211,238,0.15),rgba(244,114,182,0.9),rgba(34,211,238,0.15))]" />
              <div className="absolute inset-[1px] rounded-[7px] bg-background/90" />
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSync(account.id);
            }}
            disabled={isSyncing}
            className={cn(
              "relative z-10 p-1.5 rounded-lg bg-muted/50 text-muted-foreground transition-colors",
              isSyncing
                ? "cursor-not-allowed bg-background/90 text-primary"
                : "hover:text-primary hover:bg-muted"
            )}
            aria-label="Sync account"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
          </button>
        </div>
      )}

      {/* Balance */}
      <div className="text-right">
        <p className={cn(
          "text-sm font-bold",
          isDebt ? "text-destructive" : "neon-text-cyan"
        )}>
          {isDebt ? '-' : ''}${displayBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </motion.div>
  );
};
