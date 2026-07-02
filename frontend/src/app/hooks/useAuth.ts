import { useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'guard';
  cpf: string;
  avatar?: string;
}

// Credenciais fixas do sistema
const FIXED_CREDENTIALS = {
  admin: {
    email: 'admin@admin.com',
    password: 'admin',
    user: {
      id: 'admin-001',
      email: 'admin@admin.com',
      name: 'Administrador',
      role: 'admin' as const,
      cpf: '000.000.000-00',
    }
  },
  guard: {
    email: 'vigilante@vigilante.com',
    password: 'vigilante',
    user: {
      id: 'guard-001',
      email: 'vigilante@vigilante.com',
      name: 'Vigilante Demo',
      role: 'guard' as const,
      cpf: '111.111.111-11',
    }
  }
};

const SESSION_KEY = 'vigiasystem_session';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = useCallback(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        const sessionUser = JSON.parse(savedSession);
        setUser(sessionUser);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      // Verifica se é admin
      if (email === FIXED_CREDENTIALS.admin.email && password === FIXED_CREDENTIALS.admin.password) {
        const adminUser = FIXED_CREDENTIALS.admin.user;
        setUser(adminUser);
        localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
        return { error: null };
      }

      // Verifica se é vigilante
      if (email === FIXED_CREDENTIALS.guard.email && password === FIXED_CREDENTIALS.guard.password) {
        const guardUser = FIXED_CREDENTIALS.guard.user;
        setUser(guardUser);
        localStorage.setItem(SESSION_KEY, JSON.stringify(guardUser));
        return { error: null };
      }

      return { error: 'Email ou senha incorretos' };
    } catch (error: any) {
      return { error: error.message || 'Erro ao fazer login' };
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return { user, loading, signIn, signOut };
}
