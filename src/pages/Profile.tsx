
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ResumeAnalysisHistory from '@/components/ResumeAnalysisHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, LogOut, FileText, CreditCard, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';

const Profile = () => {
  const { user, loading } = useAuth();
  const { 
    tier, 
    scansUsed, 
    maxScans, 
    periodEnd, 
    isSubscribed,
    canAccessAICoach,
    canSaveAnalyses,
    canUnlimitedScans,
    refetch 
  } = useSubscription();
  const { toast } = useToast();
  const [isLoadingPortal, setIsLoadingPortal] = React.useState(false);
  
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setIsLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Unable to open subscription management portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const handleRefreshSubscription = async () => {
    if (!user) return;
    
    try {
      await supabase.functions.invoke('verify-subscription');
      await refetch();
      toast({
        title: "Subscription Updated",
        description: "Your subscription information has been refreshed.",
      });
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      toast({
        title: "Error",
        description: "Unable to refresh subscription status. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow py-12">
        <div className="container-custom max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <p className="text-gray-600">Manage your account and view your resume analyses</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Your Subscription</CardTitle>
                  <CardDescription>
                    {isSubscribed 
                      ? `You are on the ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan` 
                      : "You are on the Free plan"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tier === 'free' && (
                    <>
                      <div>
                        <div className="flex justify-between mb-1">
                          <p className="text-sm font-medium">Resume Scans</p>
                          <p className="text-sm text-gray-500">{scansUsed} / {maxScans}</p>
                        </div>
                        <Progress value={(scansUsed / maxScans) * 100} className="h-2" />
                      </div>
                      <p className="text-sm text-gray-500">
                        Upgrade to Pro or Premium for unlimited scans and additional features.
                      </p>
                    </>
                  )}

                  {isSubscribed && (
                    <div>
                      <p className="text-sm text-gray-500">Subscription renews</p>
                      <p className="font-medium">
                        {periodEnd 
                          ? formatDistanceToNow(new Date(periodEnd), { addSuffix: true }) 
                          : "Unknown"}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col space-y-2">
                    {isSubscribed ? (
                      <Button 
                        onClick={handleManageSubscription}
                        disabled={isLoadingPortal}
                      >
                        {isLoadingPortal ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Manage Subscription
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button className="bg-scanmatch-600 hover:bg-scanmatch-700" onClick={() => window.location.href = '/pricing'}>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Upgrade Plan
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      onClick={handleRefreshSubscription}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Refresh Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Tabs defaultValue="analyses">
                <TabsList className="mb-4">
                  <TabsTrigger value="analyses" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Resume Analyses
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Account Settings
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="analyses">
                  {tier === 'free' && (
                    <Card className="mb-6">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-yellow-100 p-2 rounded-full">
                            <CreditCard className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Upgrade to save your analyses</h3>
                            <p className="text-sm text-gray-500">
                              Pro and Premium subscribers can save unlimited analyses.
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            className="ml-auto bg-scanmatch-600 hover:bg-scanmatch-700"
                            onClick={() => window.location.href = '/pricing'}
                          >
                            Upgrade
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <ResumeAnalysisHistory />
                </TabsContent>
                
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>Manage your account preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Your Plan Features</h3>
                        <ul className="space-y-2 pl-2">
                          <li className="flex items-center text-sm">
                            <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${canUnlimitedScans ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                              {canUnlimitedScans ? '✓' : '✕'}
                            </span>
                            Unlimited Resume Scans
                          </li>
                          <li className="flex items-center text-sm">
                            <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${canSaveAnalyses ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                              {canSaveAnalyses ? '✓' : '✕'}
                            </span>
                            Save Analyses to Your Account
                          </li>
                          <li className="flex items-center text-sm">
                            <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${canAccessAICoach ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                              {canAccessAICoach ? '✓' : '✕'}
                            </span>
                            AI Resume Coach Access
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant={isSubscribed ? "outline" : "default"} 
                        className={!isSubscribed ? "bg-scanmatch-600 hover:bg-scanmatch-700 w-full" : "w-full"}
                        onClick={() => window.location.href = '/pricing'}
                      >
                        {isSubscribed ? 'Change Plan' : 'Upgrade Your Plan'}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
