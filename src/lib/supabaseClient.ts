import { createClient, User as SupabaseUser } from "@supabase/supabase-js";
import { SubscriptionTier, UserSubscription, UserProfile } from "./types";

// Export User type for usage in other files
export type User = SupabaseUser;

// Get environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and Anon Key are required. Please set the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables."
  );
}

// Create the Supabase client with security configurations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'scanmatch-frontend'
    }
  }
});

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 60; // 60 requests per minute

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit) {
    rateLimitMap.set(userId, { count: 1, timestamp: now });
    return true;
  }

  if (now - userLimit.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(userId, { count: 1, timestamp: now });
    return true;
  }

  if (userLimit.count >= MAX_REQUESTS) {
    return false;
  }

  rateLimitMap.set(userId, { ...userLimit, count: userLimit.count + 1 });
  return true;
};

// Auth related functions
export const signIn = async (email: string, password: string) => {
  if (!checkRateLimit(email)) {
    throw new Error('Too many login attempts. Please try again later.');
  }

  try {
    const response = await supabase.auth.signInWithPassword({ 
      email, 
      password,
      options: {
        captchaToken: undefined // Add captcha token if implementing captcha
      }
    });
    
    if (response.error) {
      throw response.error;
    }
    
    return {
      user: response.data.user,
      error: null
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      user: null,
      error: error instanceof Error ? error.message : 'An error occurred during sign in'
    };
  }
};

export const signUp = async (email: string, password: string) => {
  if (!checkRateLimit(email)) {
    throw new Error('Too many signup attempts. Please try again later.');
  }

  try {
    const response = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        captchaToken: undefined // Add captcha token if implementing captcha
      }
    });
    
    if (response.error) {
      throw response.error;
    }
    
    return {
      user: response.data.user,
      error: null
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      user: null,
      error: error instanceof Error ? error.message : 'An error occurred during sign up'
    };
  }
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
  resume_text: string;
  score: number;
  keywords_found: KeywordItem[] | string; // Can be array or stringified JSON
  keywords_missing: KeywordItem[] | string; // Can be array or stringified JSON
  structure_strengths: string[] | string; // Can be array or stringified JSON
  structure_improvements: string[] | string; // Can be array or stringified JSON
  created_at?: string;
  job_title?: string;
  improvement_suggestions?: string;
  interview_questions?: {
    technical: Array<{ question: string; context: string }>;
    behavioral: Array<{ question: string; context: string }>;
    resume_based: Array<{ question: string; context: string }>;
  };
};

export const saveResumeAnalysis = async (analysis: Omit<ResumeAnalysis, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('resume_analyses')
    .insert({
      user_id: analysis.user_id,
      resume_text: analysis.resume_text,
      score: analysis.score,
      keywords_found: analysis.keywords_found,
      keywords_missing: analysis.keywords_missing,
      structure_strengths: analysis.structure_strengths,
      structure_improvements: analysis.structure_improvements,
      job_title: analysis.job_title,
      improvement_suggestions: analysis.improvement_suggestions,
      interview_questions: analysis.interview_questions,
      analysis: JSON.stringify({
        score: analysis.score,
        keywords: {
          found: analysis.keywords_found,
          missing: analysis.keywords_missing
        },
        structure: {
          strengths: analysis.structure_strengths,
          improvements: analysis.structure_improvements
        },
        job_title: analysis.job_title,
        improvement_suggestions: analysis.improvement_suggestions,
        interview_questions: analysis.interview_questions
      }),
      created_at: new Date().toISOString()
    })
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
  // First get the analysis data
  const { data: analysis, error: analysisError } = await supabase
    .from('resume_analyses')
    .select('*')
    .eq('id', id)
    .single();
  
  if (analysisError) {
    console.error("Error fetching resume analysis:", analysisError);
    throw analysisError;
  }

  // Then get the corresponding resume text
  const { data: scanData, error: scanError } = await supabase
    .from('resume_scan_data')
    .select('resume_text, job_description')
    .eq('user_id', analysis.user_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (scanError) {
    console.error("Error fetching resume scan data:", scanError);
    throw scanError;
  }

  // Combine the data
  return {
    ...analysis,
    resume_text: scanData.resume_text,
    job_description: scanData.job_description
  };
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

export type ResumeScanData = {
  id: string;
  user_id: string;
  resume_text: string;
  job_description: string;
  job_title?: string;
  created_at: string;
  updated_at: string;
};

export const saveResumeScanData = async (scanData: Omit<ResumeScanData, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('resume_scan_data')
    .insert({
      ...scanData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error saving resume scan data:", error);
    throw error;
  }
  
  return data;
};

export type Database = {
  public: {
    Tables: {
      resume_analyses: {
        Row: ResumeAnalysis;
        Insert: Omit<ResumeAnalysis, 'id' | 'created_at'>;
        Update: Partial<Omit<ResumeAnalysis, 'id' | 'created_at'>>;
      };
      resume_scan_data: {
        Row: ResumeScanData;
        Insert: Omit<ResumeScanData, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ResumeScanData, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_subscriptions: {
        Row: UserSubscription;
        Insert: Omit<UserSubscription, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserSubscription, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
};

export const generateLearningPath = async (analysisId: string) => {
  try {
    // Get the analysis data
    console.log('Fetching analysis data for ID:', analysisId);
    const analysis = await getResumeAnalysis(analysisId);
    
    if (!analysis) {
      throw new Error('Analysis not found');
    }

    // Parse the missing skills and improvements
    let missingSkills, improvements;
    try {
      missingSkills = typeof analysis.keywords_missing === 'string' 
        ? JSON.parse(analysis.keywords_missing)
        : analysis.keywords_missing;
      
      improvements = typeof analysis.structure_improvements === 'string'
        ? JSON.parse(analysis.structure_improvements)
        : analysis.structure_improvements;

      console.log('Parsed analysis data:', { missingSkills, improvements });
    } catch (parseError) {
      console.error('Error parsing analysis data:', parseError);
      throw new Error('Invalid analysis data format');
    }

    // Call the Edge Function
    console.log('Calling Edge Function with:', { missingSkills, improvements, userId: analysis.user_id });
    const { data, error } = await supabase.functions.invoke('generate-learning-path', {
      body: {
        missingSkills,
        improvements,
        userId: analysis.user_id
      }
    });

    if (error) {
      console.error('Edge Function error:', error);
      if (error.message.includes('OpenAI API key')) {
        throw new Error('Service configuration error. Please contact support.');
      }
      throw error;
    }

    if (!data || !Array.isArray(data)) {
      console.error('Invalid response from Edge Function:', data);
      throw new Error('Invalid response format from learning path generator');
    }

    return data;
  } catch (error) {
    console.error('Error generating learning path:', error);
    throw error;
  }
};

export const checkIPScanLimit = async (ip: string) => {
  const { data, error } = await supabase
    .rpc('can_ip_scan', { check_ip: ip });

  if (error) {
    console.error("Error checking IP scan limit:", error);
    throw error;
  }

  return data;
};

export const incrementIPScanCount = async (ip: string) => {
  // First get the current count
  const { data: currentData, error: fetchError } = await supabase
    .from('ip_scan_tracking')
    .select('scan_count')
    .eq('ip_address', ip)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error("Error fetching scan count:", fetchError);
    throw fetchError;
  }

  if (!currentData) {
    // Insert new record if none exists
    const { error: insertError } = await supabase
      .from('ip_scan_tracking')
      .insert({
        ip_address: ip,
        scan_count: 1,
        last_reset_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error("Error creating IP scan record:", insertError);
      throw insertError;
    }
  } else {
    // Update existing record
    const { error: updateError } = await supabase
      .from('ip_scan_tracking')
      .update({ 
        scan_count: currentData.scan_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('ip_address', ip);

    if (updateError) {
      console.error("Error incrementing scan count:", updateError);
      throw updateError;
    }
  }
};
