
import { createClient } from "@supabase/supabase-js";

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

// Type definition for resume analysis
export type ResumeAnalysis = {
  id?: string;
  user_id: string;
  score: number;
  keywords_found: string[];
  keywords_missing: string[];
  structure_strengths: string[];
  structure_improvements: string[];
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
