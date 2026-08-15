'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient, setAuthToken, UserItem } from '@/lib/api';

interface AuthContextType {
  user: UserItem | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserItem | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const updateAccessToken = useCallback((token: string | null) => {
    setAccessTokenState(token);
    setAuthToken(token);
  }, []);

  const restoreSession = useCallback(async () => {
    setIsLoading(true);
    try {
      // Attempt token refresh via HttpOnly cookie or stored token
      const refreshRes = await apiClient.refresh();
      if (refreshRes.accessToken) {
        updateAccessToken(refreshRes.accessToken);
        const me = await apiClient.getMe();
        setUser(me);
      }
    } catch {
      // If refresh fails, user is unauthenticated
      updateAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [updateAccessToken]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (email: string, password: string) => {
    const res = await apiClient.login({ email, password });
    if (res.accessToken && res.user) {
      updateAccessToken(res.accessToken);
      setUser(res.user);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await apiClient.register({ name, email, password });
    if (res.accessToken && res.user) {
      updateAccessToken(res.accessToken);
      setUser(res.user);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch {
      // Ignore logout backend errors
    } finally {
      updateAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
