import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectionStore } from '@/store/useProjectionStore';
import { useIsMobile } from '@/hooks/use-mobile';
import type { RecurringItem } from '@/types/projections';

const formatAmount = (n: number) =>
  `$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const confidenceColor = (c: RecurringItem['confidence']) => {
  switch (c) {
    case 'high': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'low': return 'badge-accent';
  }
};

interface RecurringCashflowCardProps {
  onSelectItem?: (item: RecurringItem, direction: 'income' | 'expense') => void;
  onAddManualCashflow?: () => void;
  onMergeItems?: (source: RecurringItem, target: RecurringItem, direction: 'income' | 'expense') => void;
}

const CashflowRow: React.FC<{
  item: RecurringItem;
  direction: 'income' | 'expense';
  onSelectItem?: (item: RecurringItem, direction: 'income' | 'expense') => void;
  onMergeItems?: (source: RecurringItem, target: RecurringItem, direction: 'income' | 'expense') => void;
  draggedItem: { item: RecurringItem; direction: 'income' | 'expense' } | null;
  onDragItemChange: (item: { item: RecurringItem; direction: 'income' | 'expense' } | null) => void;
}> = ({ item, direction, onSelectItem, onMergeItems, draggedItem, onDragItemChange }) => (
  <motion.button
    type="button"
    whileTap={{ scale: item.accountId ? 0.985 : 1 }}
    onClick={() => item.accountId && onSelectItem?.(item, direction)}
    draggable={Boolean(item.accountId)}
    onDragStart={() => {
      onDragItemChange({ item, direction });
    }}
    onDragEnd={() => onDragItemChange(null)}
    onDragOver={(event) => {
      if (item.accountId) {
        event.preventDefault();
      }
    }}
    onDrop={(event) => {
      event.preventDefault();
      if (!draggedItem) {
        return;
      }
      if (draggedItem.item.id === item.id || draggedItem.direction !== direction) {
        return;
      }
      onMergeItems?.(draggedItem.item, item, direction);
      onDragItemChange(null);
    }}
    className={cn(
      'group relative flex w-full items-center justify-between rounded-xl border border-transparent py-2 px-2 text-left transition-all',
      item.accountId
        ? 'cursor-pointer hover:border-primary/30 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(34,211,238,0.12),rgba(244,114,182,0.12))] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_12px_32px_rgba(34,211,238,0.08)]'
        : 'cursor-default',
      'border-b border-border/10 last:border-b-0'
    )}
  >
    <div className="flex-1 min-w-0">
      <p className="text-sm text-foreground truncate">{item.label}</p>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-[10px] text-muted-foreground capitalize">{item.cadence}</span>
        <span className={cn('text-[10px]', confidenceColor(item.confidence))}>
          {item.confidence}
        </span>
        <span className="text-[10px] text-muted-foreground/50">
          {item.source === 'linked' ? item.accountName ?? 'Linked account' : 'Manual'}
        </span>
      </div>
    </div>
    <span className="text-sm font-medium text-foreground ml-2">
      {formatAmount(item.amount)}
    </span>
  </motion.button>
);

export const RecurringCashflowCard: React.FC<RecurringCashflowCardProps> = ({
  onSelectItem,
  onAddManualCashflow,
  onMergeItems,
}) => {
  const cashflow = useProjectionStore((s) => s.cashflow);
  const isLoading = useProjectionStore((s) => s.isLoadingCashflow);
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(!isMobile);
  const [draggedItem, setDraggedItem] = React.useState<{ item: RecurringItem; direction: 'income' | 'expense' } | null>(null);

  if (isLoading && !cashflow) {
    return <Skeleton className="h-32 w-full rounded-xl" />;
  }

  if (!cashflow) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl bg-muted/20 border border-border/20 overflow-hidden"
    >
      {/* Header - always visible */}
      <div className="w-full flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
        <div className="flex items-center gap-3">
          <p className="text-xs font-medium text-muted-foreground">
            Recurring Cashflow
          </p>
          <span className={cn(
            'text-xs font-medium',
            cashflow.netMonthlyCashflow >= 0 ? 'text-success' : 'text-destructive'
          )}>
            {cashflow.netMonthlyCashflow >= 0 ? '+' : ''}
            {formatAmount(cashflow.netMonthlyCashflow)}/mo
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Add recurring cashflow"
            onClick={(event) => {
              event.stopPropagation();
              onAddManualCashflow?.();
            }}
            className="rounded-lg border border-border/30 bg-background/70 p-1.5 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Collapse recurring cashflow' : 'Expand recurring cashflow'}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 pb-4">
              {/* Income */}
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <ArrowUpRight className="w-3 h-3 text-success" />
                  <p className="text-xs text-success font-medium">
                    Income · {formatAmount(cashflow.totalMonthlyIncome)}/mo
                  </p>
                </div>
                {cashflow.recurringIncome.length > 0 ? (
                  cashflow.recurringIncome.map((item) => (
                    <CashflowRow
                      key={item.id}
                      item={item}
                      direction="income"
                      onSelectItem={onSelectItem}
                      onMergeItems={onMergeItems}
                      draggedItem={draggedItem}
                      onDragItemChange={setDraggedItem}
                    />
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground/50 py-2">
                    No recurring income detected
                  </p>
                )}
              </div>

              {/* Expenses */}
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <ArrowDownRight className="w-3 h-3 text-destructive" />
                  <p className="text-xs text-destructive font-medium">
                    Expenses · {formatAmount(cashflow.totalMonthlyExpenses)}/mo
                  </p>
                </div>
                {cashflow.recurringExpenses.length > 0 ? (
                  cashflow.recurringExpenses.map((item) => (
                    <CashflowRow
                      key={item.id}
                      item={item}
                      direction="expense"
                      onSelectItem={onSelectItem}
                      onMergeItems={onMergeItems}
                      draggedItem={draggedItem}
                      onDragItemChange={setDraggedItem}
                    />
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground/50 py-2">
                    No recurring expenses detected
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
