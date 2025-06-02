import React from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import AIResumeCoach from '@/components/AIResumeCoach';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, MessageCircle, FileText, Sparkles } from 'lucide-react';

const AICoach = () => {
  const { user } = useAuth();
  const { canAccessAICoach } = useSubscription();

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow py-12">
        <div className="container-custom max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center">
              <Brain className="mr-2 h-6 w-6 text-scanmatch-600" />
              AI Resume Coach
            </h1>
            <p className="text-gray-600">Get personalized advice to improve your resume and job applications</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AIResumeCoach />
            </div>
            
            <div className="lg:col-span-1 space-y-6">
              {!user && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Sign in to get started</h2>
                    <p className="text-gray-600 mb-4">
                      Create an account or sign in to use the AI Resume Coach and other premium features.
                    </p>
                    <div className="flex flex-col space-y-2">
                      <Button className="bg-scanmatch-600 hover:bg-scanmatch-700" asChild>
                        <a href="/signup">Sign Up</a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a href="/login">Login</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {user && !canAccessAICoach && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Sparkles className="h-5 w-5 text-amber-400 mr-2" />
                      <h2 className="text-xl font-semibold">Pro Feature</h2>
                    </div>
                    <p className="text-gray-600 mb-4">
                      AI Resume Coach is available to Pro and Premium subscribers. Upgrade now to unlock this feature.
                    </p>
                    <Button className="w-full bg-scanmatch-600 hover:bg-scanmatch-700" asChild>
                      <a href="/pricing">Upgrade to Pro</a>
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">How to use the AI Coach</h2>
                  <ul className="space-y-4">
                    <li className="flex">
                      <div className="bg-gray-100 rounded-full p-2 mr-3 h-8 w-8 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="h-4 w-4 text-scanmatch-600" />
                      </div>
                      <div>
                        <p className="font-medium">Ask for resume advice</p>
                        <p className="text-sm text-gray-500">Get suggestions on improving your resume structure, content, and formatting.</p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="bg-gray-100 rounded-full p-2 mr-3 h-8 w-8 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-scanmatch-600" />
                      </div>
                      <div>
                        <p className="font-medium">Get interview tips</p>
                        <p className="text-sm text-gray-500">Practice answering common interview questions and get feedback.</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AICoach;