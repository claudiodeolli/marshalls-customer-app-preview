'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

const LS_KEYS = ['USER_TOKEN', 'USER_UUID', 'BENEFICIARY_UUID', 'CLIENT_ID', 'APP_USER'];

const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_MODE === '1';

const MOCK_USER = {
  name: 'João da Silva',
  firstName: 'João',
  uuid: 'mock-uuid-001',
  beneficiaryUuid: 'mock-beneficiary-001',
  userToken: 'mock-token-demo',
  clientId: 'mock-client-id',
};

function readFromStorage() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('USER_TOKEN');
  const beneficiaryUuid = localStorage.getItem('BENEFICIARY_UUID');
  if (!token || !beneficiaryUuid) return null;
  try {
    const raw = localStorage.getItem('APP_USER');
    return raw ? JSON.parse(raw) : { beneficiaryUuid };
  } catch {
    return { beneficiaryUuid };
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');
  const router = useRouter();

  useEffect(() => {
    if (IS_MOCK) {
      // Limpa dados reais que possam ter ficado de sessões anteriores
      if (typeof window !== 'undefined') {
        LS_KEYS.forEach(k => localStorage.removeItem(k));
      }
      setUser(MOCK_USER);
      setStatus('authenticated');
      return;
    }
    const stored = readFromStorage();
    if (stored) {
      setUser(stored);
      setStatus('authenticated');
    } else {
      setStatus('unauthenticated');
    }
  }, []);

  const login = useCallback((userData) => {
    if (IS_MOCK) return;
    const token = userData.userToken ?? userData.token ?? userData.accessToken ?? '';
    const uuid = userData.uuid ?? userData.id ?? userData.sub ?? '';
    const beneficiaryUuid = userData.beneficiaryUuid ?? '';
    const clientId = userData.clientId ?? '';
    localStorage.setItem('USER_TOKEN', token);
    localStorage.setItem('USER_UUID', uuid);
    localStorage.setItem('BENEFICIARY_UUID', beneficiaryUuid);
    localStorage.setItem('CLIENT_ID', clientId);
    localStorage.setItem('APP_USER', JSON.stringify(userData));
    setUser(userData);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    if (IS_MOCK) {
      router.push('/plantao');
      return;
    }
    LS_KEYS.forEach((k) => localStorage.removeItem(k));
    setUser(null);
    setStatus('unauthenticated');
    router.push('/login');
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return {
    user: ctx.user,
    isAuthenticated: ctx.status === 'authenticated',
    isLoading: ctx.status === 'loading',
    logout: ctx.logout,
    login: ctx.login,
    status: ctx.status,
    session: ctx.user ? { user: ctx.user } : null,
  };
}
