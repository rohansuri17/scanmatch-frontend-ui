import React, { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import AIResumeCoach from '@/components/AIResumeCoach';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, FileText, MessageCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

const AICoach = () => {
  const { user } = useAuth();
  const { tier, canAccessAICoach } = useSubscription();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_coach_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });  // Load all sessions in order

      if (error) throw error;

      if (data && data.length > 0) {
        // Get the most recent session's messages
        const latestSession = data[data.length - 1];
        setMessages(latestSession.messages || []);
      } else {
        // No existing chat, start with welcome message
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: 'Hello! I\'m your AI Career Coach. How can I help you today? You can ask me about:\n\n• Resume reviews and improvements\n• Interview preparation and practice\n• Career path planning\n• Skill development recommendations',
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-coach-session', {
        body: {
          user_id: user?.id,
          messages: updatedMessages
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: data.id,
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Save the entire conversation to the database
      const { error: saveError } = await supabase
        .from('ai_coach_sessions')
        .upsert({
          user_id: user?.id,
          messages: finalMessages,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (saveError) throw saveError;

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="lg:col-span-2 h-[600px]">
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
                        <p className="text-sm text-gray-500">Practice answering common interview questions for your industry or role.</p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="bg-gray-100 rounded-full p-2 mr-3 h-8 w-8 flex items-center justify-center flex-shrink-0">
                        <ArrowRight className="h-4 w-4 text-scanmatch-600" />
                      </div>
                      <div>
                        <p className="font-medium">Job search guidance</p>
                        <p className="text-sm text-gray-500">Learn strategies for finding and applying to jobs that match your skills.</p>
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