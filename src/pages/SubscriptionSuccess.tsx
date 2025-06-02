import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user } = useAuth();
  const { refetch } = useSubscription();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifySubscription = async () => {
      if (!user || !sessionId) {
        console.log('Missing user or sessionId:', { user: !!user, sessionId });
        return;
      }

      console.log('Starting subscription verification with:', { sessionId, userId: user.id });

      try {
        // Call the verify-subscription function to update the user's subscription status
        const { data, error } = await supabase.functions.invoke('verify-subscription', {
          body: { session_id: sessionId }
        });
        
        console.log('Verify subscription response:', { data, error });
        
        if (error) throw error;
        
        await refetch();
        console.log('Subscription refetched after verification');
      } catch (error) {
        console.error('Error verifying subscription:', error);
        setError('There was a problem verifying your subscription. Your account will be updated shortly.');
      } finally {
        setIsRefreshing(false);
      }
    };

    verifySubscription();
  }, [user, sessionId, refetch]);

  if (!sessionId) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Invalid Request</CardTitle>
              <CardDescription>No session information was provided.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Please return to the pricing page to complete your subscription.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate('/pricing')}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Go to Pricing
              </Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow flex items-center justify-center py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Subscription Successful!</CardTitle>
            <CardDescription>
              Thank you for subscribing to ScanMatch.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isRefreshing ? (
              <div className="flex flex-col items-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-scanmatch-600 mb-4" />
                <p className="text-gray-500">Updating your account...</p>
              </div>
            ) : (
              <>
                <p className="text-center">
                  Your subscription has been activated. You now have access to all the premium features.
                </p>
                
                {error && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-800">
                    {error}
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              className="w-full bg-scanmatch-600 hover:bg-scanmatch-700" 
              onClick={() => navigate('/scan')}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Start Scanning
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/profile')}
            >
              Go to Profile
            </Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default SubscriptionSuccess;
