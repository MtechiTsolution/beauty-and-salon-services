import { authApi } from '@mit-salon/shared/api';
import type { User } from '@mit-salon/shared/types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { email: string; full_name: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  loginAsDemo: (role: 'customer' | 'admin') => Promise<void>;
  updateProfile: (data: { full_name?: string; phone?: string }) => Promise<User>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const me = await authApi.me();
    setUser(me);
  }, []);

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login: async (email, password) => {
        const u = await authApi.login(email, password);
        setUser(u);
        return u;
      },
      register: async (data) => {
        const u = await authApi.register(data);
        setUser(u);
      },
      logout: async () => {
        await authApi.logout();
        setUser(null);
      },
      loginAsDemo: async (role) => {
        const u = await authApi.loginAsDemo(role);
        setUser(u);
      },
      updateProfile: async (data) => {
        const u = await authApi.updateProfile(data);
        setUser(u);
        return u;
      },
      refresh,
    }),
    [user, isLoading, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
