/** Projection system types — mirrors backend response shapes */

export type ProjectionHorizon = 3 | 6 | 12;

export interface ProjectionDataPoint {
  month: string; // e.g. "2026-04"
  value: number;
  isProjected: boolean;
}

export interface GoalMilestone {
  goalId: string;
  goalTitle: string;
  month: string;
  projectedValue: number;
  targetValue: number;
}

export interface ProjectionOverview {
  currentNetWorth: number;
  projectedNetWorth: number;
  monthlyNetCashflow: number;
  horizonMonths: number;
  projectedDate: string; // ISO date string
  confidence: 'high' | 'medium' | 'low' | 'insufficient';
  assumptions: string[];
  dataPoints: ProjectionDataPoint[];
  goalMilestones: GoalMilestone[];
}

export interface RecurringItem {
  id: string;
  label: string;
  amount: number;
  cadence: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual';
  confidence: 'high' | 'medium' | 'low';
  source: 'linked' | 'manual';
  category?: string;
  accountId?: string;
  accountName?: string;
  sourceTransactionIds?: string[];
  mergedSources?: Array<{
    id: string;
    label: string;
    accountName?: string;
    sourceTransactionIds: string[];
  }>;
}

export interface CashflowSummary {
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  netMonthlyCashflow: number;
  recurringIncome: RecurringItem[];
  recurringExpenses: RecurringItem[];
}

export interface GoalForecast {
  goalId: string;
  goalTitle: string;
  currentBalance: number;
  targetBalance: number;
  projectedCompletionDate: string | null;
  monthlyAllocation: number;
  confidence: 'high' | 'medium' | 'low' | 'insufficient';
}

export interface ScenarioInputs {
  monthlySavingsIncrease: number;
  diningReduction: number;
  subscriptionReduction: number;
  incomeAdjustment: number;
  excludedGoalId: string | null;
}

export interface ProjectionScenarioResult {
  baselineNetWorth: number;
  scenarioNetWorth: number;
  delta: number;
  horizonMonths: number;
  dataPoints: ProjectionDataPoint[];
  goalForecasts: GoalForecast[];
}

export interface ManualFinancialAccount {
  id: string;
  name: string;
  type: 'cash' | 'investment' | 'retirement' | 'property' | 'other';
  balance: number;
  isDebt: boolean;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManualCashflow {
  id: string;
  label: string;
  amount: number;
  type: 'income' | 'expense';
  cadence: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual';
  category?: string;
  createdAt: string;
  updatedAt: string;
}
