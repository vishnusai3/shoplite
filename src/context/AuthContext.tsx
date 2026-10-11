import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types.ts';
import { api, setAuthToken, getAuthToken } from '../services/api.ts';
import { supabase, isSupabaseClientConfigured } from '../services/supabaseClient.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (role: 'admin' | 'customer') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      // 1. If Supabase Auth is active and configured
      if (isSupabaseClientConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setAuthToken(session.access_token);
        }
      }

      const res = await api.getMe();
      if (res.isAuthenticated && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('Error fetching current user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    // Listen to Supabase auth state changes if configured
    if (isSupabaseClientConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          setAuthToken(session.access_token);
          await fetchCurrentUser();
        } else {
          setAuthToken(null);
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      if (isSupabaseClientConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setLoading(false);
          return { success: false, error: error.message };
        }
        if (data.session) {
          setAuthToken(data.session.access_token);
        }
        await fetchCurrentUser();
        return { success: true };
      }

      // Built-in Demo account credentials fallback
      if (email === 'admin@shoplite.dev') {
        await loginAsDemo('admin');
        return { success: true };
      }
      if (email === 'customer@shoplite.dev' || email.includes('@')) {
        await loginAsDemo('customer');
        return { success: true };
      }

      return { success: false, error: 'Invalid email or password' };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const register = async (email: string, password: string, fullName: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      if (isSupabaseClientConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) {
          setLoading(false);
          return { success: false, error: error.message };
        }
        if (data.session) {
          setAuthToken(data.session.access_token);
          await api.syncProfile({
            id: data.user!.id,
            email,
            fullName,
            role: 'customer',
          });
        }
        await fetchCurrentUser();
        return { success: true };
      }

      // Demo registration
      const newUserId = 'user_' + Math.random().toString(36).substring(2, 10);
      setAuthToken(newUserId);
      await api.syncProfile({
        id: newUserId,
        email,
        fullName,
        role: 'customer',
      });
      await fetchCurrentUser();
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const loginAsDemo = async (role: 'admin' | 'customer') => {
    setLoading(true);
    try {
      const res = await api.loginDemo(role);
      setAuthToken(res.token);
      await fetchCurrentUser();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isSupabaseClientConfigured && supabase) {
        await supabase.auth.signOut();
      }
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        register,
        loginAsDemo,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
