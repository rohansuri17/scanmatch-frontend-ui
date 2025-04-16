import { createClient, User as SupabaseUser } from "@supabase/supabase-js";
import { SubscriptionTier, UserSubscription, UserProfile } from "./types";

// Export User type for usage in other files
export type User = SupabaseUser;

// Get environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL and Anon Key are required. Please set the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables."
  );
}

// Create the Supabase client with default values to prevent runtime crashes
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Auth related functions
export const signIn = async (email: string, password: string) => {
  const response = await supabase.auth.signInWithPassword({ email, password });
  return {
    user: response.data.user,
    error: response.error
  };
};

export const signUp = async (email: string, password: string) => {
  const response = await supabase.auth.signUp({ email, password });
  return {
    user: response.data.user,
    error: response.error
  };
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getSession = async () => {
  return await supabase.auth.getSession();
};

export const authSubscribe = (callback: (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED' | 'INITIAL_SESSION', session: any) => void) => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event as any, session);
  });
  
  return {
    unsubscribe: () => {
      data.subscription.unsubscribe();
    }
  };
};

// Type definition for keyword objects
export type KeywordItem = string | { word: string; category?: string };

// Type definition for resume analysis
export type ResumeAnalysis = {
  id?: string;
  user_id: string;
  score: number;
  keywords_found: KeywordItem[] | string; // Can be array or stringified JSON
  keywords_missing: KeywordItem[] | string; // Can be array or stringified JSON
  structure_strengths: string[] | string; // Can be array or stringified JSON
  structure_improvements: string[] | string; // Can be array or stringified JSON
  created_at?: string;
  job_title?: string;
};

export const saveResumeAnalysis = async (analysis: Omit<ResumeAnalysis, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('resume_analyses')
    .insert(analysis)
    .select()
    .single();
  
  if (error) {
    console.error("Error saving resume analysis:", error);
    throw error;
  }
  
  return data;
};

export const getUserResumeAnalyses = async (userId: string) => {
  const { data, error } = await supabase
    .from('resume_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching resume analyses:", error);
    throw error;
  }
  
  return data;
};

export const getResumeAnalysis = async (id: string) => {
  const { data, error } = await supabase
    .from('resume_analyses')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error("Error fetching resume analysis:", error);
    throw error;
  }
  
  return data;
};

// Subscription-related functions
export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGSQL_ERROR_NO_ROWS') {
    console.error("Error fetching user subscription:", error);
    throw error;
  }
  
  // If no subscription found, return default free tier
  if (!data) {
    return {
      user_id: userId,
      subscription_tier: 'free',
      scans_used: 0,
      max_scans: 5,
    };
  }
  
  return data;
};

export const initUserSubscription = async (userId: string): Promise<UserSubscription> => {
  // Check if user already has a subscription
  const { data: existingSub } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (existingSub) {
    return existingSub;
  }
  
  // Create a new free subscription
  const newSubscription = {
    user_id: userId,
    subscription_tier: 'free' as SubscriptionTier,
    scans_used: 0,
    max_scans: 5,
  };
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .insert(newSubscription)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating user subscription:", error);
    throw error;
  }
  
  return data;
};

export const incrementScanCount = async (userId: string): Promise<number> => {
  // First get the current subscription
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (!subscription) {
    await initUserSubscription(userId);
    return 1;
  }
  
  const newCount = (subscription.scans_used || 0) + 1;
  
  // Update the scan count
  const { error } = await supabase
    .from('user_subscriptions')
    .update({ scans_used: newCount, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  
  if (error) {
    console.error("Error incrementing scan count:", error);
    throw error;
  }
  
  return newCount;
};

export const canUserScan = async (userId: string): Promise<boolean> => {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    return false;
  }
  
  // Free users have scan limits
  if (subscription.subscription_tier === 'free') {
    return (subscription.scans_used || 0) < (subscription.max_scans || 5);
  }
  
  // Pro and Premium users can always scan
  return true;
};

export const resetScanCount = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_subscriptions')
    .update({ scans_used: 0, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  
  if (error) {
    console.error("Error resetting scan count:", error);
    throw error;
  }
};

// User Profile related functions
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGSQL_ERROR_NO_ROWS') {
    console.error("Error fetching user profile:", error);
    throw error;
  }
  
  return data;
};

export const createUserProfile = async (profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      ...profile,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
  
  return data;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
  
  return data;
};
