
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ResumeAnalysisHistory from '@/components/ResumeAnalysisHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, LogOut, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
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
                  <ResumeAnalysisHistory />
                </TabsContent>
                
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>Manage your account preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500">Account settings will be available soon.</p>
                    </CardContent>
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
