import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function apiRequest<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  options: {
    retry?: boolean;
    showToast?: boolean;
    errorMessage?: string;
  } = {}
): Promise<ApiResponse<T>> {
  const { retry = true, showToast = true, errorMessage } = options;
  let attempts = 0;

  while (attempts < (retry ? MAX_RETRIES : 1)) {
    try {
      const { data, error } = await operation();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      attempts++;
      
      if (attempts === MAX_RETRIES || !retry) {
        console.error('API request failed:', error);
        
        if (showToast) {
          toast({
            title: "Error",
            description: errorMessage || (error instanceof Error ? error.message : 'An unexpected error occurred'),
            variant: "destructive",
          });
        }

        return {
          data: null,
          error: error instanceof Error ? error : new Error('An unexpected error occurred')
        };
      }

      await delay(RETRY_DELAY * attempts);
    }
  }

  return {
    data: null,
    error: new Error('Maximum retry attempts reached')
  };
}

// Example usage:
export async function fetchUserProfile(userId: string) {
  return apiRequest(
    () => supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single(),
    {
      errorMessage: 'Failed to fetch user profile'
    }
  );
}

export async function updateUserProfile(userId: string, updates: any) {
  return apiRequest(
    () => supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .single(),
    {
      errorMessage: 'Failed to update user profile'
    }
  );
}

// Add more API functions as needed 