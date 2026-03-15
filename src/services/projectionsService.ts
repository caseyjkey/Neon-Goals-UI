import { apiClient } from './apiClient';
import type {
  ProjectionOverview,
  CashflowSummary,
  ProjectionScenarioResult,
  ScenarioInputs,
  ProjectionHorizon,
  GoalForecast,
} from '@/types/projections';

export const projectionsService = {
  async getOverview(horizon: ProjectionHorizon = 12): Promise<ProjectionOverview> {
    return apiClient.get<ProjectionOverview>(`/projections/overview?horizon=${horizon}`);
  },

  async getCashflow(): Promise<CashflowSummary> {
    return apiClient.get<CashflowSummary>('/projections/cashflow');
  },

  async getForecast(horizon: ProjectionHorizon = 12): Promise<GoalForecast[]> {
    return apiClient.post<GoalForecast[]>('/projections/forecast', { horizon });
  },

  async runScenario(inputs: ScenarioInputs, horizon: ProjectionHorizon = 12): Promise<ProjectionScenarioResult> {
    return apiClient.post<ProjectionScenarioResult>('/projections/scenario', {
      ...inputs,
      horizon,
    });
  },
};
