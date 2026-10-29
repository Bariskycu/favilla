
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      if (localStorage.getItem('token')) {
        // Migrate old token if exists
        localStorage.setItem('accessToken', localStorage.getItem('token')!);
        localStorage.removeItem('token');
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await api.auth.me();
      if (response.success && response.data.user.role === 'admin') {
        setIsAuthenticated(true);
        setUser(response.data.user);
      } else {
        // Not admin or invalid token
        logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // @ts-ignore - handling potential different response structures
      const response = await api.auth.login(email, password);

      // Support both structure types just in case
      // @ts-ignore
      const accessToken = response.data.accessToken || response.data.token;
      // @ts-ignore
      const refreshToken = response.data.refreshToken;

      if (response.success && response.data.user.role === 'admin') {
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        }
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        setIsAuthenticated(true);
        setUser(response.data.user);
      } else {
        console.warn('Login blocked: User role is missing or not admin.', response.data.user);
        throw new Error('Bu panele erişim yetkiniz yok.');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const logout = () => {
    // Optionally call logout API if token exists
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (token || refreshToken) {
      // Try to logout carefully
      api.auth.logout(refreshToken || undefined).catch(console.error);
    }

    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token'); // Clean up old one
    localStorage.removeItem('refreshToken');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
