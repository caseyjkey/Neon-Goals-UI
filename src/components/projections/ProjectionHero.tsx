import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectionStore } from '@/store/useProjectionStore';
import type { ProjectionHorizon } from '@/types/projections';

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

export const ProjectionHero: React.FC = () => {
  const overview = useProjectionStore((s) => s.overview);
  const isLoading = useProjectionStore((s) => s.isLoadingOverview);
  const selectedHorizon = useProjectionStore((s) => s.selectedHorizon);
  const setHorizon = useProjectionStore((s) => s.setHorizon);
  const error = useProjectionStore((s) => s.error);

  if (error && !overview) {
    return (
      <div className="p-4 rounded-xl bg-muted/30 border border-border/30 text-center">
        <p className="text-sm text-muted-foreground">Projections unavailable</p>
        <p className="text-xs text-muted-foreground/60 mt-1">{error}</p>
      </div>
    );
  }

  if (isLoading && !overview) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 justify-end">
          {HORIZONS.map((h) => (
            <Skeleton key={h.value} className="h-8 w-12 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-6 w-3/4 rounded" />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="p-6 rounded-xl bg-muted/20 border border-border/20 text-center">
        <TrendingUp className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Link accounts or add manual data to see your projection
        </p>
      </div>
    );
  }

  const isPositiveCashflow = overview.monthlyNetCashflow >= 0;
  const delta = overview.projectedNetWorth - overview.currentNetWorth;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
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

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Current Net Worth */}
        <div className="p-4 rounded-xl bg-muted/20 border border-border/20">
          <p className="text-xs text-muted-foreground mb-1">Now</p>
          <p className="text-xl font-heading font-bold neon-text-magenta">
            {formatCurrency(overview.currentNetWorth)}
          </p>
        </div>

        {/* Projected Net Worth */}
        <div className="p-4 rounded-xl bg-muted/20 border border-primary/20">
          <p className="text-xs text-muted-foreground mb-1">
            In {overview.horizonMonths}mo
          </p>
          <p className="text-xl font-heading font-bold neon-text-cyan">
            {formatCurrency(overview.projectedNetWorth)}
          </p>
          <p className={cn(
            'text-xs mt-1 flex items-center gap-0.5',
            delta >= 0 ? 'text-success' : 'text-destructive'
          )}>
            {delta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {delta >= 0 ? '+' : ''}{formatCurrency(delta)}
          </p>
        </div>

        {/* Monthly Cashflow */}
        <div className="p-4 rounded-xl bg-muted/20 border border-border/20">
          <p className="text-xs text-muted-foreground mb-1">Monthly cashflow</p>
          <p className={cn(
            'text-xl font-heading font-bold',
            isPositiveCashflow ? 'text-success' : 'text-destructive'
          )}>
            {isPositiveCashflow ? '+' : ''}{formatCurrency(overview.monthlyNetCashflow)}
          </p>
        </div>
      </div>

      {/* Headline */}
      <p className="text-sm text-muted-foreground">
        At your current pace, you could reach{' '}
        <span className="text-foreground font-medium">
          {formatCurrency(overview.projectedNetWorth)}
        </span>{' '}
        by{' '}
        <span className="text-foreground font-medium">
          {formatDate(overview.projectedDate)}
        </span>
        .
      </p>

      {/* Confidence indicator */}
      {overview.confidence !== 'high' && (
        <p className="text-xs text-warning">
          {overview.confidence === 'insufficient'
            ? 'Not enough data for reliable projections yet.'
            : overview.confidence === 'low'
            ? 'Limited data — projections are rough estimates.'
            : 'Based on limited history. Accuracy improves over time.'}
        </p>
      )}
    </motion.div>
  );
};
