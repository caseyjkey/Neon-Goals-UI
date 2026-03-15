import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, AlertTriangle, Landmark, DollarSign, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectionStore } from '@/store/useProjectionStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { usePlaid } from '@/hooks/usePlaidLink';
import { ManualAccountDialog } from './ManualAccountDialog';
import { ManualCashflowDialog } from './ManualCashflowDialog';

export const AccountCoverageCard: React.FC = () => {
  const overview = useProjectionStore((s) => s.overview);
  const manualAccounts = useProjectionStore((s) => s.manualAccounts);
  const manualCashflows = useProjectionStore((s) => s.manualCashflows);
  const removeManualAccount = useProjectionStore((s) => s.removeManualAccount);
  const removeManualCashflow = useProjectionStore((s) => s.removeManualCashflow);
  const { accounts: plaidAccounts } = usePlaid();
  const { open: openPlaidLink, isLoading: isPlaidLoading } = usePlaid();

  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showCashflowDialog, setShowCashflowDialog] = useState(false);

  const totalLinked = plaidAccounts.length;
  const totalManual = manualAccounts.length;
  const isLowConfidence = overview?.confidence === 'low' || overview?.confidence === 'insufficient';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl bg-muted/20 border border-border/20 p-4 space-y-3"
      >
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Account Coverage
        </p>

        {/* Summary */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{totalLinked} linked</span>
          <span>{totalManual} manual</span>
          <span>{manualCashflows.length} cashflow entries</span>
        </div>

        {/* Low confidence warning */}
        {isLowConfidence && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="w-3.5 h-3.5 text-warning mt-0.5 flex-shrink-0" />
            <p className="text-xs text-warning">
              {overview?.confidence === 'insufficient'
                ? 'Add accounts or manual data to enable projections.'
                : 'Limited coverage may reduce projection accuracy.'}
            </p>
          </div>
        )}

        {/* Manual accounts list */}
        {manualAccounts.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
              Manual Accounts
            </p>
            {manualAccounts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between py-1.5 text-xs"
              >
                <span className="text-foreground truncate">{a.name}</span>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'font-medium',
                    a.isDebt ? 'text-destructive' : 'text-foreground'
                  )}>
                    {a.isDebt ? '-' : ''}${Math.abs(a.balance).toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeManualAccount(a.id)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Manual cashflows list */}
        {manualCashflows.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
              Manual Cashflows
            </p>
            {manualCashflows.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between py-1.5 text-xs"
              >
                <div className="flex items-center gap-1 truncate">
                  <span className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    c.type === 'income' ? 'bg-success' : 'bg-destructive'
                  )} />
                  <span className="text-foreground truncate">{c.label}</span>
                  <span className="text-muted-foreground/50 capitalize">{c.cadence}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    ${c.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeManualCashflow(c.id)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => openPlaidLink()}
            disabled={isPlaidLoading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium
              bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
          >
            <Landmark className="w-3 h-3" />
            Link Account
          </button>
          <button
            onClick={() => setShowAccountDialog(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium
              bg-muted/30 text-foreground border border-border/30 hover:bg-muted/50 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Manual Account
          </button>
          <button
            onClick={() => setShowCashflowDialog(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium
              bg-muted/30 text-foreground border border-border/30 hover:bg-muted/50 transition-colors"
          >
            <DollarSign className="w-3 h-3" />
            Manual Cashflow
          </button>
        </div>
      </motion.div>

      <ManualAccountDialog
        open={showAccountDialog}
        onOpenChange={setShowAccountDialog}
      />
      <ManualCashflowDialog
        open={showCashflowDialog}
        onOpenChange={setShowCashflowDialog}
      />
    </>
  );
};
