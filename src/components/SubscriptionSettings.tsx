
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { ArrowRight, CreditCard, Gauge, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const SubscriptionSettings = () => {
  const { tier, scansUsed, maxScans, periodEnd, refreshSubscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleManageSubscription = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {});
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error accessing customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open the subscription management portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefreshSubscription = async () => {
    setIsLoading(true);
    
    try {
      await refreshSubscription();
      toast({
        title: "Subscription Updated",
        description: "Your subscription information has been refreshed.",
      });
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to update subscription information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Subscription</CardTitle>
        <CardDescription>
          Manage your subscription plan and limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-gray-50 rounded-lg border">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Current Plan</span>
            <span className="font-bold text-scanmatch-700 capitalize">{tier || 'Free'}</span>
          </div>
          
          {periodEnd && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Renews on</span>
              <span>{format(new Date(periodEnd), 'MMM d, yyyy')}</span>
            </div>
          )}
          
          {tier === 'free' && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Resume Scans Used</span>
                <span>{scansUsed} / {maxScans}</span>
              </div>
              <Progress value={(scansUsed / maxScans) * 100} className="h-2" />
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={handleRefreshSubscription} 
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Gauge className="h-4 w-4 mr-2" />
            )}
            Refresh Subscription
          </Button>
          
          {tier !== 'free' && (
            <Button 
              onClick={handleManageSubscription} 
              className="bg-scanmatch-600 hover:bg-scanmatch-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Manage Subscription
            </Button>
          )}
          
          {tier === 'free' && (
            <Button 
              className="bg-scanmatch-600 hover:bg-scanmatch-700"
              onClick={() => window.location.href = '/pricing'}
            >
              Upgrade Plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionSettings;
