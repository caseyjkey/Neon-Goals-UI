import React, { useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sliders, RotateCcw, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectionStore } from '@/store/useProjectionStore';
import { useGoalsStore } from '@/store/useGoalsStore';
import type { FinanceGoal } from '@/types/goals';

const formatCurrency = (n: number) =>
  `$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const SliderRow: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
}> = ({ label, value, onChange, min = 0, max = 2000, step = 50, prefix = '$' }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <label className="text-xs text-muted-foreground">{label}</label>
      <span className="text-xs font-medium text-foreground">
        {value > 0 ? '+' : ''}{prefix}{Math.abs(value).toLocaleString()}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none bg-muted/50 cursor-pointer
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
        [&::-webkit-slider-thumb]:shadow-[0_0_8px_hsl(186_100%_50%/0.5)]
        [&::-webkit-slider-thumb]:cursor-pointer"
    />
  </div>
);

export const ScenarioControls: React.FC = () => {
  const scenarioInputs = useProjectionStore((s) => s.scenarioInputs);
  const setScenarioInputs = useProjectionStore((s) => s.setScenarioInputs);
  const resetScenario = useProjectionStore((s) => s.resetScenario);
  const runScenario = useProjectionStore((s) => s.runScenario);
  const scenario = useProjectionStore((s) => s.scenario);
  const isLoading = useProjectionStore((s) => s.isLoadingScenario);
  const overview = useProjectionStore((s) => s.overview);

  const goals = useGoalsStore((s) => s.goals);
  const financeGoals = goals.filter(
    (g): g is FinanceGoal => g.type === 'finance' && g.status === 'active'
  );

  // Debounced scenario run
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const triggerScenario = useCallback(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runScenario();
    }, 600);
  }, [runScenario]);

  // Run scenario when inputs change (only if any input is non-default)
  const hasChanges =
    scenarioInputs.monthlySavingsIncrease !== 0 ||
    scenarioInputs.diningReduction !== 0 ||
    scenarioInputs.subscriptionReduction !== 0 ||
    scenarioInputs.incomeAdjustment !== 0 ||
    scenarioInputs.excludedGoalId !== null;

  useEffect(() => {
    if (hasChanges) triggerScenario();
    return () => clearTimeout(debounceRef.current);
  }, [scenarioInputs, hasChanges, triggerScenario]);

  if (!overview) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl bg-muted/20 border border-border/20 p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Sliders className="w-3 h-3" />
          What-If Scenarios
        </p>
        <div className="flex items-center gap-2">
          {isLoading && <Loader2 className="w-3 h-3 text-primary animate-spin" />}
          {hasChanges && (
            <button
              onClick={resetScenario}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      <SliderRow
        label="Increase monthly savings"
        value={scenarioInputs.monthlySavingsIncrease}
        onChange={(v) => setScenarioInputs({ monthlySavingsIncrease: v })}
      />

      <SliderRow
        label="Reduce dining out"
        value={scenarioInputs.diningReduction}
        onChange={(v) => setScenarioInputs({ diningReduction: v })}
        max={1000}
      />

      <SliderRow
        label="Reduce subscriptions"
        value={scenarioInputs.subscriptionReduction}
        onChange={(v) => setScenarioInputs({ subscriptionReduction: v })}
        max={500}
        step={25}
      />

      <SliderRow
        label="Adjust monthly income"
        value={scenarioInputs.incomeAdjustment}
        onChange={(v) => setScenarioInputs({ incomeAdjustment: v })}
        min={-5000}
        max={5000}
        step={250}
      />

      {/* Exclude goal */}
      {financeGoals.length > 0 && (
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Exclude a goal</label>
          <select
            value={scenarioInputs.excludedGoalId ?? ''}
            onChange={(e) =>
              setScenarioInputs({
                excludedGoalId: e.target.value || null,
              })
            }
            className="w-full text-xs p-2 rounded-lg bg-muted/30 border border-border/30 text-foreground"
          >
            <option value="">None</option>
            {financeGoals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Delta result */}
      {scenario && hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-muted/30 border border-primary/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Scenario impact</span>
            <span className={cn(
              'text-sm font-heading font-bold flex items-center gap-0.5',
              scenario.delta >= 0 ? 'text-success' : 'text-destructive'
            )}>
              {scenario.delta >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {scenario.delta >= 0 ? '+' : ''}{formatCurrency(scenario.delta)}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            vs. baseline over {scenario.horizonMonths} months
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};
