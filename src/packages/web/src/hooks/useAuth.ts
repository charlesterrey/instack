import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: 'admin' | 'creator' | 'viewer';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const API_BASE_URL = import.meta.env['VITE_API_URL'] as string ?? 'http://localhost:8787';

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const response = await api.get<User>('/api/users/me');
      if (response.data) {
        setState({ user: response.data, isAuthenticated: true, isLoading: false });
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    };
    void checkAuth();
  }, []);

  const login = useCallback((redirectUrl?: string) => {
    const params = redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : '';
    window.location.href = `${API_BASE_URL}/api/auth/login${params}`;
  }, []);

  const logout = useCallback(async () => {
    await api.post('/api/auth/logout');
    setState({ user: null, isAuthenticated: false, isLoading: false });
    window.location.href = '/login';
  }, []);

  return { ...state, login, logout };
}
