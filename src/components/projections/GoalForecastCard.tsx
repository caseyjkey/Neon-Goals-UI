import React from 'react';
import { motion } from 'framer-motion';
import { Target, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectionStore } from '@/store/useProjectionStore';

const formatCurrency = (n: number) =>
  `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const formatDate = (iso: string | null) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export const GoalForecastCard: React.FC = () => {
  const forecasts = useProjectionStore((s) => s.goalForecasts);
  const isLoading = useProjectionStore((s) => s.isLoadingOverview);

  if (isLoading && forecasts.length === 0) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    );
  }

  if (forecasts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
        <Target className="w-3 h-3" />
        Goal Forecasts
      </p>

      {forecasts.map((fc) => {
        const progress = Math.min((fc.currentBalance / fc.targetBalance) * 100, 100);
        const dateLabel = formatDate(fc.projectedCompletionDate);

        return (
          <div
            key={fc.goalId}
            className="p-3 rounded-xl bg-muted/20 border border-border/20 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground truncate">
                {fc.goalTitle}
              </span>
              {fc.confidence === 'insufficient' ? (
                <span className="badge-warning text-[10px] flex items-center gap-0.5">
                  <HelpCircle className="w-3 h-3" />
                  Needs more data
                </span>
              ) : dateLabel ? (
                <span className="text-xs text-muted-foreground">
                  Est. {dateLabel}
                </span>
              ) : (
                <span className="text-xs text-warning">No target date</span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(fc.currentBalance)}</span>
              <span>{formatCurrency(fc.targetBalance)}</span>
            </div>

            <div className="progress-neon">
              <div
                className="progress-neon-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            {fc.monthlyAllocation > 0 && fc.confidence !== 'insufficient' && (
              <p className="text-[10px] text-muted-foreground/60">
                ~{formatCurrency(fc.monthlyAllocation)}/mo estimated allocation
              </p>
            )}
          </div>
        );
      })}

      {forecasts.length > 1 && (
        <p className="text-[10px] text-muted-foreground/50 text-center">
          Allocations are estimated based on current cashflow
        </p>
      )}
    </motion.div>
  );
};
