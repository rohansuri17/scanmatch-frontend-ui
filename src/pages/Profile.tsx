
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import ResumeAnalysisHistory from '@/components/ResumeAnalysisHistory';
import { Loader2, Settings, ClipboardList } from 'lucide-react';
import AccountSettings from '@/components/AccountSettings';
import SubscriptionSettings from '@/components/SubscriptionSettings';

const Profile = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("history");
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow py-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-scanmatch-600" />
            <p>Loading your profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow py-12 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Not Signed In</CardTitle>
              <CardDescription>Please sign in to view your profile</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <a href="/login" className="bg-scanmatch-600 hover:bg-scanmatch-700 text-white py-2 px-4 rounded">
                Sign In
              </a>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow py-12">
        <div className="container-custom max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Account</h1>
            <p className="text-gray-600">
              {user?.email}
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="history" className="flex items-center">
                <ClipboardList className="h-4 w-4 mr-2" />
                Resume History
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="history">
              <ResumeAnalysisHistory />
            </TabsContent>
            
            <TabsContent value="settings">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <AccountSettings />
                </div>
                <div>
                  <SubscriptionSettings />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
