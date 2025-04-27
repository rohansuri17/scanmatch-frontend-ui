import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserSubscription, incrementScanCount, canUserScan } from '@/lib/supabaseClient';
import { useAuth } from './useAuth';
import { SubscriptionTier, UserSubscriptionInfo } from '@/lib/types';
import { useToast } from './use-toast';

export function useSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);

  const REFRESH_COOLDOWN = 30000; // 30 seconds
  
  const { 
    data: subscription, 
    isLoading: isSubscriptionLoading,
    error: subscriptionError,
    refetch 
  } = useQuery({
    queryKey: ['userSubscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      try {
        const directResult = await getUserSubscription(user.id);
        
        if (directResult) {
          return directResult;
        }
        
        const response = await fetch('/api/verify-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({ userId: user.id })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        return {
          user_id: user.id,
          subscription_tier: data.subscription_tier || 'free',
          scans_used: data.scans_used || 0,
          max_scans: data.max_scans || 5,
          subscription_period_end: data.subscription_period_end,
          is_cached: data.cached || false
        };
      } catch (error) {
        console.error("Error fetching subscription:", error);
        
        if (retryCount >= 3) {
          console.log("Using fallback subscription data after failed retries");
          return {
            user_id: user.id,
            subscription_tier: 'free' as SubscriptionTier,
            scans_used: 0,
            max_scans: 5,
            is_fallback: true
          };
        }
        
        setRetryCount(prev => prev + 1);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * (2 ** attemptIndex), 30000),
    onError: (error) => {
      console.error("Subscription fetch error:", error);
      if (retryCount >= 3) {
        toast({
          title: "Subscription Information Unavailable",
          description: "Using default subscription settings. Please try again later.",
          variant: "destructive",
        });
      }
    }
  });

  const subscriptionInfo: UserSubscriptionInfo = {
    isSubscribed: subscription?.subscription_tier !== 'free',
    tier: subscription?.subscription_tier || 'free',
    scansUsed: subscription?.scans_used || 0,
    maxScans: subscription?.max_scans || 5,
    periodEnd: subscription?.subscription_period_end,
    canAccessAICoach: subscription?.subscription_tier === 'pro' || subscription?.subscription_tier === 'premium',
    canSaveAnalyses: subscription?.subscription_tier !== 'free',
    canUnlimitedScans: subscription?.subscription_tier !== 'free',
    isFallback: subscription?.is_fallback || false,
    isCached: subscription?.is_cached || false,
  };

  const incrementScan = async () => {
    if (!user) return false;
    
    try {
      const newCount = await incrementScanCount(user.id);
      
      if (Date.now() - lastRefreshTime > REFRESH_COOLDOWN) {
        await refetch();
        setLastRefreshTime(Date.now());
      }
      
      return true;
    } catch (error) {
      console.error("Error incrementing scan count:", error);
      
      toast({
        title: "Error Updating Scan Count",
        description: "There was a problem updating your scan count. Please try again.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const checkCanScan = async () => {
    if (!user) return false;
    
    try {
      const canScan = await canUserScan(user.id);
      
      if (!canScan && subscription?.subscription_tier === 'free') {
        toast({
          title: "Scan Limit Reached",
          description: "You've reached your free scan limit. Consider upgrading for unlimited scans.",
          variant: "destructive",
        });
      }
      
      return canScan;
    } catch (error) {
      console.error("Error checking scan permissions:", error);
      
      if (subscription) {
        return subscription.subscription_tier !== 'free' || 
               (subscription.scans_used || 0) < (subscription.max_scans || 5);
      }
      
      toast({
        title: "Connectivity Issue",
        description: "Unable to verify scan quota. You may proceed, but counts may be updated later.",
        variant: "warning",
      });
      
      return true;
    }
  };

  const refreshSubscription = async () => {
    if (Date.now() - lastRefreshTime < REFRESH_COOLDOWN) {
      return null;
    }
    
    setLastRefreshTime(Date.now());
    return await refetch();
  };

  useEffect(() => {
    if (!isSubscriptionLoading) {
      setIsLoading(false);
    }
  }, [isSubscriptionLoading]);

  useEffect(() => {
    if (subscription?.is_fallback) {
      toast({
        title: "Using Offline Data",
        description: "You're viewing cached subscription information. Some features may be limited.",
        variant: "warning",
      });
    }
  }, [subscription?.is_fallback]);

  return {
    subscription,
    ...subscriptionInfo,
    isLoading,
    error: subscriptionError,
    refetch,
    refreshSubscription,
    incrementScan,
    checkCanScan,
  };
}
