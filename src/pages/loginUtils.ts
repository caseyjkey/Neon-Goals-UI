type DemoUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

type LoginDemoParams = {
  logout: () => void;
  demoLogin: () => Promise<DemoUser>;
  setUser: (user: DemoUser) => void;
  setDemoMode: (enabled: boolean) => void;
  fetchGoals: () => Promise<void>;
  navigate: (path: string) => void;
  onError: (error: unknown) => void;
};

export async function loginDemo({
  logout,
  demoLogin,
  setUser,
  setDemoMode,
  fetchGoals,
  navigate,
  onError,
}: LoginDemoParams): Promise<void> {
  try {
    logout();
    const demoUser = await demoLogin();
    setUser(demoUser);
    setDemoMode(true);
    await fetchGoals();
    navigate('/');
  } catch (error) {
    onError(error);
  }
}
