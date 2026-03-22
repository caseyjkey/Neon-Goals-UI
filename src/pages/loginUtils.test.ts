import { describe, it, expect, vi } from 'vitest';

import { loginDemo } from './loginUtils';

describe('loginDemo', () => {
  it('authenticates demo user and navigates on success', async () => {
    const logout = vi.fn();
    const demoLogin = vi.fn().mockResolvedValue({ id: 'u1', name: 'Demo', email: 'demo@goals-af.com' });
    const setUser = vi.fn();
    const setDemoMode = vi.fn();
    const fetchGoals = vi.fn().mockResolvedValue(undefined);
    const navigate = vi.fn();
    const onError = vi.fn();

    await loginDemo({
      logout,
      demoLogin,
      setUser,
      setDemoMode,
      fetchGoals,
      navigate,
      onError,
    });

    expect(logout).toHaveBeenCalledTimes(1);
    expect(demoLogin).toHaveBeenCalledTimes(1);
    expect(setUser).toHaveBeenCalledWith({ id: 'u1', name: 'Demo', email: 'demo@goals-af.com' });
    expect(setDemoMode).toHaveBeenCalledWith(true);
    expect(fetchGoals).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/');
    expect(onError).not.toHaveBeenCalled();
  });

  it('does not fallback to a local demo user when demo auth fails', async () => {
    const logout = vi.fn();
    const demoLogin = vi.fn().mockRejectedValue(new Error('Demo auth failed'));
    const setUser = vi.fn();
    const setDemoMode = vi.fn();
    const fetchGoals = vi.fn().mockResolvedValue(undefined);
    const navigate = vi.fn();
    const onError = vi.fn();

    await loginDemo({
      logout,
      demoLogin,
      setUser,
      setDemoMode,
      fetchGoals,
      navigate,
      onError,
    });

    expect(setUser).not.toHaveBeenCalled();
    expect(setDemoMode).not.toHaveBeenCalledWith(true);
    expect(fetchGoals).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
