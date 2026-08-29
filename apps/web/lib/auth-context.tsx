'use client';

import type { AuthUser, LoginResponse } from '@expense-flow/shared';
import React, { createContext, useContext, useState } from 'react';

export interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  csrfToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  fetchCsrfToken: () => Promise<string | null>;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
  logoutClient: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // In-Memory Authentication State ONLY (Never persisted to localStorage)
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Includes HttpOnly cookie
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message =
        errorData?.error?.message || 'Login failed. Please check your credentials.';
      throw new Error(message);
    }

    const json: LoginResponse = await res.json();
    setUser(json.data.user);
    setAccessToken(json.data.accessToken);
    setCsrfToken(json.data.csrfToken);
  };

  const fetchCsrfToken = async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/csrf`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) return null;
      const json = await res.json();
      const newCsrf = json?.data?.csrfToken || null;
      if (newCsrf) setCsrfToken(newCsrf);
      return newCsrf;
    } catch {
      return null;
    }
  };

  const refreshAuth = async (): Promise<void> => {
    let tokenToUse = csrfToken;
    if (!tokenToUse) {
      tokenToUse = await fetchCsrfToken();
    }

    if (!tokenToUse) {
      logoutClient();
      throw new Error('CSRF token could not be obtained');
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': tokenToUse,
      },
      credentials: 'include',
    });

    if (!res.ok) {
      logoutClient();
      throw new Error('Session refresh failed');
    }

    const json = await res.json();
    setAccessToken(json.data.accessToken);
    setCsrfToken(json.data.csrfToken);
  };

  const logout = async (): Promise<void> => {
    try {
      if (csrfToken) {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'X-CSRF-Token': csrfToken,
          },
          credentials: 'include',
        });
      }
    } finally {
      logoutClient();
    }
  };

  const logoutClient = () => {
    setUser(null);
    setAccessToken(null);
    setCsrfToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        csrfToken,
        isAuthenticated: !!user && !!accessToken,
        login,
        fetchCsrfToken,
        refreshAuth,
        logout,
        logoutClient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
