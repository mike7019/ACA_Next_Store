import { createContext, useContext, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth.ts';
import type { Admin } from '../api/types.ts';

interface AuthContextValue {
  admin: Admin | null;
  status: 'idle' | 'loading' | 'authenticated' | 'anonymous';
  checkSession: () => Promise<Admin | null>;
  login: (email: string, password: string) => Promise<Admin>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [status, setStatus] = useState<AuthContextValue['status']>('idle');

  const checkSession = async () => {
    setStatus('loading');
    try {
      const current = await authApi.me();
      setAdmin(current);
      setStatus('authenticated');
      return current;
    } catch {
      setAdmin(null);
      setStatus('anonymous');
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    const current = await authApi.login(email, password);
    setAdmin(current);
    setStatus('authenticated');
    return current;
  };

  const logout = async () => {
    await authApi.logout();
    setAdmin(null);
    setStatus('anonymous');
  };

  return (
    <AuthContext.Provider value={{ admin, status, checkSession, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
