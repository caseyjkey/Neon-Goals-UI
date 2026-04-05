import { describe, expect, it } from 'vitest';
import { resolveGoalForRoute } from './goalRouteSelection';
import { mockGoals } from '@/data/mockGoals';

describe('resolveGoalForRoute', () => {
  it('prefers the drilled-into nested goal over the original route goal', () => {
    const resolved = resolveGoalForRoute(mockGoals, 'group-1', 'item-longboard-2');

    expect(resolved?.id).toBe('item-longboard-2');
    expect(resolved?.type).toBe('item');
  });

  it('falls back to the route goal when no drilled goal is active', () => {
    const resolved = resolveGoalForRoute(mockGoals, 'group-1', null);

    expect(resolved?.id).toBe('group-1');
    expect(resolved?.type).toBe('group');
  });
});
