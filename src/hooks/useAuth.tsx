
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, getSession, signIn, signOut, signUp, supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

// Improved error handling with proper typing
type AuthError = {
  message: string;
  status?: number;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  login: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  updateUserEmail?: (email: string) => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session timeout management (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;
let sessionTimer: NodeJS.Timeout | null = null;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Function to reset session timer
  const resetSessionTimer = () => {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }
    
    // Only set a timer if user is logged in
    if (user) {
      sessionTimer = setTimeout(() => {
        // If no activity for SESSION_TIMEOUT, log the user out
        if (Date.now() - lastActivity > SESSION_TIMEOUT) {
          toast({
            title: "Session Expired",
            description: "Your session has expired due to inactivity. Please log in again.",
          });
          logout();
        }
      }, SESSION_TIMEOUT);
    }
  };

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
      resetSessionTimer();
    };

    // Add event listeners for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      // Clean up event listeners
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      
      if (sessionTimer) clearTimeout(sessionTimer);
    };
  }, [user, lastActivity]);

  // Initialize user session
  useEffect(() => {
    const initUser = async () => {
      setIsLoading(true);
      try {
        // Check for session in local storage
        const { data } = await getSession();
        
        if (data.session?.user) {
          setUser(data.session.user);
          resetSessionTimer();
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        toast({
          title: "Authentication Error",
          description: "Failed to verify your login status. Please try again.",
          variant: "destructive",
        });
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        resetSessionTimer();
        
        toast({
          title: "Signed In",
          description: `Welcome${session.user.email ? ` ${session.user.email}` : ''}!`,
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        if (sessionTimer) clearTimeout(sessionTimer);
        
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
        });
      } else if (event === 'PASSWORD_RECOVERY') {
        toast({
          title: "Password Reset",
          description: "Please enter your new password.",
        });
      } else if (event === 'USER_UPDATED') {
        if (session?.user) {
          setUser(session.user);
          
          toast({
            title: "Profile Updated",
            description: "Your account information has been updated.",
          });
        }
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
      if (sessionTimer) clearTimeout(sessionTimer);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsAuthenticating(true);
      
      if (!email || !password) {
        return {
          user: null,
          error: { message: "Email and password are required" }
        };
      }
      
      // Add security: prevent login attempts with suspicious inputs
      if (email.includes('<script>') || password.includes('<script>')) {
        console.error('Suspicious input detected in login attempt');
        return {
          user: null,
          error: { message: "Invalid input detected" }
        };
      }
      
      const { user, error } = await signIn(email, password);
      
      if (error) {
        console.error('Login error:', error);
        return { 
          user: null, 
          error: { 
            message: error.message || "Login failed. Please check your credentials.",
            status: error.status
          } 
        };
      }
      
      return { user, error: null };
    } catch (error) {
      console.error('Unexpected login error:', error);
      return { 
        user: null,
        error: { 
          message: error instanceof Error ? error.message : "An unexpected error occurred"
        }
      };
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      if (sessionTimer) clearTimeout(sessionTimer);
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "Logout Error",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setIsAuthenticating(true);
      
      if (!email || !password) {
        return {
          user: null,
          error: { message: "Email and password are required" }
        };
      }
      
      // Validate password strength
      if (password.length < 8) {
        return {
          user: null,
          error: { message: "Password must be at least 8 characters long" }
        };
      }
      
      const { user, error } = await signUp(email, password);
      
      if (error) {
        return { 
          user: null,
          error: { 
            message: error.message || "Registration failed. Please try again.",
            status: error.status
          }
        };
      }
      
      toast({
        title: "Account Created",
        description: "Please check your email to confirm your account.",
      });
      
      return { user, error: null };
    } catch (error) {
      console.error('Unexpected registration error:', error);
      return { 
        user: null,
        error: { 
          message: error instanceof Error ? error.message : "An unexpected error occurred"
        }
      };
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Add password reset functionality
  const resetPassword = async (email: string) => {
    try {
      if (!email) {
        return {
          success: false,
          error: { message: "Email is required" }
        };
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        return { 
          success: false,
          error: { 
            message: error.message || "Password reset request failed",
            status: error.status
          }
        };
      }
      
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for a password reset link.",
      });
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error during password reset:', error);
      return { 
        success: false,
        error: { 
          message: error instanceof Error ? error.message : "An unexpected error occurred"
        }
      };
    }
  };

  const updateUserEmail = (email: string) => {
    if (user) {
      setUser({ ...user, email });
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        isLoading, 
        isAuthenticating,
        login, 
        logout, 
        register, 
        updateUserEmail,
        resetPassword
      }}
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
