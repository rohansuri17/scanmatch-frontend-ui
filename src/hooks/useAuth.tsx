
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, getSession, signIn, signOut, signUp, supabase } from '@/lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  updateUserEmail?: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      setIsLoading(true);
      try {
        const { data } = await getSession();
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { user, error } = await signIn(email, password);
    return { user, error };
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  const register = async (email: string, password: string) => {
    const { user, error } = await signUp(email, password);
    return { user, error };
  };

  const updateUserEmail = (email: string) => {
    if (user) {
      setUser({ ...user, email });
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, register, updateUserEmail }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
