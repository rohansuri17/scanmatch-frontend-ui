
import { createContext, useContext, useEffect, useState } from 'react';
import { User, signIn, signUp, signOut, getSession, supabase } from '@/lib/supabaseClient';

// Define the auth context type
export type AuthContextType = {
  user: User | null;
  isLoading: boolean;  // Maintain isLoading property
  loading: boolean;    // Add loading property for backward compatibility 
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  loading: true,  // Add loading property here as well
  signIn: () => Promise.resolve({ user: null, error: null }),
  signUp: () => Promise.resolve({ user: null, error: null }),
  signOut: () => Promise.resolve(),
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
      setIsLoading(false);
    });

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setIsLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Wrap signOut to match the Promise<void> return type
  const handleSignOut = async (): Promise<void> => {
    await signOut();
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      loading: isLoading, // Add loading as alias for isLoading for backward compatibility
      signIn, 
      signUp, 
      signOut: handleSignOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
