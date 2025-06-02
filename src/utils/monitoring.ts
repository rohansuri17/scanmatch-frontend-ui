import { supabase } from '@/lib/supabaseClient';

interface ErrorEvent {
  message: string;
  stack?: string;
  component?: string;
  timestamp: string;
  user_id?: string;
}

interface PerformanceEvent {
  name: string;
  duration: number;
  timestamp: string;
  user_id?: string;
}

export const logError = async (error: Error, component?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const errorEvent: ErrorEvent = {
      message: error.message,
      stack: error.stack,
      component,
      timestamp: new Date().toISOString(),
      user_id: user?.id
    };
    
    await supabase
      .from('error_logs')
      .insert(errorEvent);
      
    console.error('Error logged:', errorEvent);
  } catch (err) {
    console.error('Failed to log error:', err);
  }
};

export const logPerformance = async (name: string, duration: number) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const performanceEvent: PerformanceEvent = {
      name,
      duration,
      timestamp: new Date().toISOString(),
      user_id: user?.id
    };
    
    await supabase
      .from('performance_logs')
      .insert(performanceEvent);
      
    console.log('Performance logged:', performanceEvent);
  } catch (err) {
    console.error('Failed to log performance:', err);
  }
};

export const trackPageView = async (path: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase
      .from('page_views')
      .insert({
        path,
        timestamp: new Date().toISOString(),
        user_id: user?.id
      });
      
    console.log('Page view tracked:', path);
  } catch (err) {
    console.error('Failed to track page view:', err);
  }
}; 