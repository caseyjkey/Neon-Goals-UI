import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Sparkles,
  Calendar,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectionStore } from '@/store/useProjectionStore';
import { useGoalsStore } from '@/store/useGoalsStore';
import { usePlaid } from '@/hooks/usePlaidLink';
import { ProjectionChartCard } from '@/components/projections/ProjectionChartCard';
import type { ProjectionHorizon } from '@/types/projections';
import type { FinanceGoal } from '@/types/goals';

const HORIZONS: { value: ProjectionHorizon; label: string }[] = [
  { value: 3, label: '3m' },
  { value: 6, label: '6m' },
  { value: 12, label: '12m' },
];

const formatCurrency = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const isDebtType = (type: string, subtype?: string) => {
  const typeLower = type.toLowerCase();
  const subtypeLower = subtype?.toLowerCase() || '';
  return (
    ['credit', 'loan'].includes(typeLower) ||
    ['credit_card', 'auto', 'mortgage', 'student', 'loan'].includes(subtypeLower)
  );
};

interface OverviewProjectionCardProps {
  className?: string;
}

export const OverviewProjectionCard: React.FC<OverviewProjectionCardProps> = ({ className }) => {
  const overview = useProjectionStore((s) => s.overview);
  const isLoading = useProjectionStore((s) => s.isLoadingOverview);
  const selectedHorizon = useProjectionStore((s) => s.selectedHorizon);
  const setHorizon = useProjectionStore((s) => s.setHorizon);
  const error = useProjectionStore((s) => s.error);
  const fetchOverview = useProjectionStore((s) => s.fetchOverview);
  const fetchCashflow = useProjectionStore((s) => s.fetchCashflow);
  const fetchGoalForecasts = useProjectionStore((s) => s.fetchGoalForecasts);
  const fetchManualAccounts = useProjectionStore((s) => s.fetchManualAccounts);
  const fetchManualCashflows = useProjectionStore((s) => s.fetchManualCashflows);
  const goalForecasts = useProjectionStore((s) => s.goalForecasts);

  const { goals } = useGoalsStore();
  const { accounts, isLoading: isPlaidLoading } = usePlaid();

  const [showDetails, setShowDetails] = useState(false);

  // Fetch projection data on mount
  useEffect(() => {
    fetchOverview();
    fetchCashflow();
    fetchGoalForecasts();
    fetchManualAccounts();
    fetchManualCashflows();
  }, [fetchOverview, fetchCashflow, fetchGoalForecasts, fetchManualAccounts, fetchManualCashflows]);

  const financeGoals = goals.filter(
    (goal): goal is FinanceGoal => goal.type === 'finance' && goal.status === 'active'
  );

  const hasAnyAccounts = accounts.length > 0;

  // Compute totals
  const totalAssets = accounts
    .filter(a => !isDebtType(a.accountType, a.accountSubtype) && !a.isDebt)
    .reduce((sum, a) => sum + a.currentBalance, 0);
  const totalDebt = accounts
    .filter(a => isDebtType(a.accountType, a.accountSubtype) || a.isDebt)
    .reduce((sum, a) => sum + Math.abs(a.currentBalance), 0);
  const netWorth = totalAssets - totalDebt;

  const goalsOnTrack = financeGoals.filter(goal => {
    const progress = goal.currentBalance / goal.targetBalance;
    return progress >= 0.5;
  }).length;

  // Momentum signals
  const isPositiveCashflow = overview ? overview.monthlyNetCashflow >= 0 : true;
  const delta = overview ? overview.projectedNetWorth - overview.currentNetWorth : 0;

  // Empty state
  if (error && !overview && !isLoading) {
    return (
      <div className={cn("glass-card neon-border p-6 text-center", className)}>
        <TrendingUp className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Link accounts or add financial goals to see your projection
        </p>
      </div>
    );
  }

  // Loading skeleton
  if (isLoading && !overview) {
    return (
      <div className={cn("glass-card neon-border p-6 space-y-4", className)}>
        <Skeleton className="h-6 w-3/4 rounded" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("glass-card neon-border overflow-hidden", className)}
    >
      <div className="p-6 space-y-5">
        {/* Headline — Motivation First */}
        {overview && (
          <div className="space-y-3">
            {/* Insight headline */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading font-bold text-foreground text-lg leading-tight">
                  On track to reach{' '}
                  <span className="neon-text-cyan">
                    {formatCurrency(overview.projectedNetWorth)}
                  </span>{' '}
                  by {formatDate(overview.projectedDate)}
                </h3>
                {overview.confidence !== 'high' && overview.confidence !== 'insufficient' && (
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Based on {overview.confidence === 'low' ? 'limited' : 'partial'} data
                  </p>
                )}
              </div>
            </div>

            {/* Horizon Toggle */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Projection horizon
              </p>
              <div className="flex gap-1 p-1 rounded-lg bg-muted/30 border border-border/30">
                {HORIZONS.map((h) => (
                  <button
                    key={h.value}
                    onClick={() => setHorizon(h.value)}
                    className={cn(
                      'px-3 py-1 rounded-md text-xs font-medium transition-all',
                      selectedHorizon === h.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Key Metrics — 2-3 max */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Monthly Momentum */}
              <div className="p-3 rounded-xl bg-muted/20 border border-border/20">
                <p className="text-[10px] text-muted-foreground mb-0.5">Monthly Momentum</p>
                <p className={cn(
                  'text-lg font-heading font-bold',
                  isPositiveCashflow ? 'text-success' : 'text-destructive'
                )}>
                  {isPositiveCashflow ? '+' : ''}{formatCurrency(overview.monthlyNetCashflow)}<span className="text-xs font-normal text-muted-foreground">/mo</span>
                </p>
              </div>

              {/* Projected Change */}
              <div className="p-3 rounded-xl bg-muted/20 border border-primary/10">
                <p className="text-[10px] text-muted-foreground mb-0.5">
                  {overview.horizonMonths}mo Change
                </p>
                <p className={cn(
                  'text-lg font-heading font-bold flex items-center gap-0.5',
                  delta >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {delta >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {delta >= 0 ? '+' : ''}{formatCurrency(delta)}
                </p>
              </div>

              {/* Goals On Track */}
              {financeGoals.length > 0 && (
                <div className="p-3 rounded-xl bg-muted/20 border border-border/20 col-span-2 sm:col-span-1">
                  <p className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Goals On Track
                  </p>
                  <p className="text-lg font-heading font-bold neon-text-cyan">
                    {goalsOnTrack} / {financeGoals.length}
                  </p>
                </div>
              )}
            </div>

            {/* Positive reinforcement signals */}
            {isPositiveCashflow && delta > 0 && (
              <p className="text-xs text-success/80 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                You're building momentum — keep it up!
              </p>
            )}
          </div>
        )}

        {/* Mini Trajectory Chart */}
        <ProjectionChartCard />

        {/* Expandable Details Accordion */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between py-2 px-1 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <span className="text-xs font-medium">
            {showDetails ? 'Hide' : 'View'} current balances
          </span>
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform duration-200",
            showDetails && "rotate-180"
          )} />
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pb-2">
                {/* Compact stat rows */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/20">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Net Worth</p>
                    <p className={cn(
                      "text-sm font-heading font-bold neon-text-magenta",
                      isPlaidLoading && !hasAnyAccounts && "animate-pulse"
                    )}>
                      {isPlaidLoading && !hasAnyAccounts ? '...' : hasAnyAccounts ? formatCurrency(netWorth) : '—'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/20">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Assets</p>
                    <p className={cn(
                      "text-sm font-heading font-bold text-success",
                      isPlaidLoading && !hasAnyAccounts && "animate-pulse"
                    )}>
                      {isPlaidLoading && !hasAnyAccounts ? '...' : hasAnyAccounts ? formatCurrency(totalAssets) : '—'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/20">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Debt</p>
                    <p className={cn(
                      "text-sm font-heading font-bold text-destructive",
                      isPlaidLoading && !hasAnyAccounts && "animate-pulse"
                    )}>
                      {isPlaidLoading && !hasAnyAccounts ? '...' : totalDebt > 0 ? `-${formatCurrency(totalDebt)}` : hasAnyAccounts ? '$0' : '—'}
                    </p>
                  </div>
                </div>

                {/* Account count summary */}
                <p className="text-[10px] text-muted-foreground text-center">
                  {accounts.length} linked account{accounts.length !== 1 ? 's' : ''} • {financeGoals.length} active goal{financeGoals.length !== 1 ? 's' : ''}
                </p>

                {/* Goal forecasts summary (compact) */}
                {goalForecasts.length > 0 && (
                  <div className="space-y-2">
                    {goalForecasts.slice(0, 3).map((fc) => {
                      const progress = Math.min((fc.currentBalance / fc.targetBalance) * 100, 100);
                      const dateLabel = fc.projectedCompletionDate
                        ? new Date(fc.projectedCompletionDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : null;
                      return (
                        <div key={fc.goalId} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-foreground font-medium truncate">{fc.goalTitle}</span>
                            <span className="text-muted-foreground">
                              {dateLabel ? `Est. ${dateLabel}` : `${progress.toFixed(0)}%`}
                            </span>
                          </div>
                          <div className="progress-neon">
                            <div className="progress-neon-fill" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Confidence / assumptions */}
                {overview && overview.confidence !== 'high' && (
                  <p className="text-[10px] text-warning text-center">
                    {overview.confidence === 'insufficient'
                      ? 'Not enough data for reliable projections yet.'
                      : overview.confidence === 'low'
                      ? 'Limited data — projections are rough estimates.'
                      : 'Accuracy improves with more transaction history.'}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
