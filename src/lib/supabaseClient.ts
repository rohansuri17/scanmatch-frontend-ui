
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
