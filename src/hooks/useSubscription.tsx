import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserSubscription, incrementScanCount, canUserScan } from '@/lib/supabaseClient';
import { useAuth } from './useAuth';
import { SubscriptionTier, UserSubscriptionInfo } from '@/lib/types';

export function useSubscription() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);  // Initialize as false

  // Query for fetching subscription data with optimized caching
  const { 
    data: subscription, 
    isLoading: isSubscriptionLoading,
    refetch 
  } = useQuery({
    queryKey: ['userSubscription', user?.id],
    queryFn: () => (user ? getUserSubscription(user.id) : Promise.resolve(null)),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch when component mounts
    refetchOnReconnect: false, // Don't refetch when reconnecting
  });

  // Calculate derived subscription info with default values
  const subscriptionInfo: UserSubscriptionInfo = {
    isSubscribed: subscription?.subscription_tier !== 'free',
    tier: subscription?.subscription_tier || 'free',
    scansUsed: subscription?.scans_used || 0,
    maxScans: subscription?.max_scans || 5,
    periodEnd: subscription?.subscription_period_end,
    canAccessAICoach: subscription?.subscription_tier === 'pro' || subscription?.subscription_tier === 'premium',
    canSaveAnalyses: subscription?.subscription_tier !== 'free',
    canUnlimitedScans: subscription?.subscription_tier !== 'free',
  };

  // Update loading state based on subscription loading only
  useEffect(() => {
    setIsLoading(isSubscriptionLoading);
  }, [isSubscriptionLoading]);

  return {
    ...subscriptionInfo,
    isLoading,
    refetch,
    refreshSubscription: refetch,
    incrementScan: async () => {
      if (!user) return false;
      try {
        await incrementScanCount(user.id);
        await refetch();
        return true;
      } catch (error) {
        console.error("Error incrementing scan count:", error);
        return false;
      }
    },
    checkCanScan: async () => {
      if (!user) return false;
      return await canUserScan(user.id);
    }
  };
}
