
export type SubscriptionTier = 'free' | 'pro' | 'premium';

export type UserSubscription = {
  id?: string;
  user_id: string;
  stripe_customer_id?: string;
  subscription_tier: SubscriptionTier;
  subscription_id?: string;
  subscription_status?: string;
  subscription_period_end?: string;
  scans_used?: number;
  max_scans?: number;
  created_at?: string;
  updated_at?: string;
};

export type UserSubscriptionInfo = {
  isSubscribed: boolean;
  tier: SubscriptionTier;
  scansUsed: number;
  maxScans: number;
  periodEnd?: string;
  canAccessAICoach: boolean;
  canSaveAnalyses: boolean;
  canUnlimitedScans: boolean;
};
