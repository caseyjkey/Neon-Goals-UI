import type { Goal } from '@/types/goals';

const findGoalById = (goals: Goal[], id: string): Goal | null => {
  for (const goal of goals) {
    if (goal.id === id) return goal;
    if (goal.subgoals && goal.subgoals.length > 0) {
      const found = findGoalById(goal.subgoals, id);
      if (found) return found;
    }
  }

  return null;
};

export const resolveGoalForRoute = (
  goals: Goal[],
  routeGoalId: string | undefined,
  currentGoalId: string | null,
): Goal | null => {
  const effectiveGoalId = currentGoalId || routeGoalId;

  if (!effectiveGoalId) {
    return null;
  }

  return findGoalById(goals, effectiveGoalId);
};
