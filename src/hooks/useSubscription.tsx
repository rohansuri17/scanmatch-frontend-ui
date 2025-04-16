
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserSubscription, incrementScanCount, canUserScan } from '@/lib/supabaseClient';
import { useAuth } from './useAuth';
import { SubscriptionTier, UserSubscriptionInfo } from '@/lib/types';

export function useSubscription() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Query for fetching subscription data
  const { 
    data: subscription, 
    isLoading: isSubscriptionLoading,
    refetch 
  } = useQuery({
    queryKey: ['userSubscription', user?.id],
    queryFn: () => (user ? getUserSubscription(user.id) : Promise.resolve(null)),
    enabled: !!user,
  });

  // Calculate derived subscription info
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

  // Increment scan count function
  const incrementScan = async () => {
    if (!user) return false;
    
    try {
      const newCount = await incrementScanCount(user.id);
      await refetch();
      return true;
    } catch (error) {
      console.error("Error incrementing scan count:", error);
      return false;
    }
  };

  // Check if user can perform a scan
  const checkCanScan = async () => {
    if (!user) return false;
    return await canUserScan(user.id);
  };

  // Add refreshSubscription function to match what's used in SubscriptionSettings
  const refreshSubscription = async () => {
    return await refetch();
  };

  // Clean up loading state when subscription query completes
  useEffect(() => {
    if (!isSubscriptionLoading) {
      setIsLoading(false);
    }
  }, [isSubscriptionLoading]);

  return {
    subscription,
    ...subscriptionInfo,
    isLoading,
    refetch,
    refreshSubscription,
    incrementScan,
    checkCanScan,
  };
}
