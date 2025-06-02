/** @jsxImportSource react */
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Bot, Send, Lock, Sparkles, User, Loader2, GraduationCap, BookOpen, FileText } from 'lucide-react';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

interface AICoachSession {
  id: string;
  user_id: string;
  messages: Message[];
  resume_text: string;
  created_at: string;
}

const AIResumeCoach = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { canAccessAICoach, isLoading: isSubscriptionLoading } = useSubscription();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [resumeText, setResumeText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initializeChat = async () => {
      if (!user || !canAccessAICoach) return;

      setIsInitializing(true);
      try {
        // Get the most recent resume analysis
        const { data: resumeData, error: resumeError } = await supabase
          .from('resume_analyses')
          .select('resume_text')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (resumeError && resumeError.code !== 'PGRST116') throw resumeError;
        if (resumeData?.resume_text) {
          setResumeText(resumeData.resume_text);
        }

        // Get the most recent chat session
        const { data: sessionData, error: sessionError } = await supabase
          .from('ai_coach_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (sessionError && sessionError.code !== 'PGRST116') throw sessionError;
        
        if (sessionData?.messages) {
          setMessages(sessionData.messages);
        } else {
          // Set welcome message if no existing chat
          setMessages([{
            id: '0',
            role: 'assistant',
            content: 'Hello! I\'m your AI Career Coach. I can help you improve your resume, prepare for interviews, and provide job search advice. What would you like help with?',
            timestamp: new Date().toISOString()
          }]);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chat history. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsInitializing(false);
      }
    };

    if (!isAuthLoading && !isSubscriptionLoading) {
      initializeChat();
    }
  }, [user, canAccessAICoach, isAuthLoading, isSubscriptionLoading, toast]);

  // Add effect to handle suggestion from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const suggestion = params.get('suggestion');
    if (suggestion) {
      setInput(decodeURIComponent(suggestion));
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname);
      // Focus the input
      inputRef.current?.focus();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user || !canAccessAICoach) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('ai-coach-session', {
        body: {
          user_id: user.id,
          session_type: 'resume',
          message: userMessage.content,
          messages: messages
        }
      });

      if (error) throw error;
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content.summary,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant message
      const { error: updateError } = await supabase
        .from('ai_coach_sessions')
        .upsert({
          user_id: user.id,
          messages: [...messages, userMessage, assistantMessage],
          resume_text: resumeText,
          created_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

    } catch (error) {
      console.error('Error in chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
      // Remove the user message if we failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = async () => {
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Resume Coach. I can help you improve your resume, prepare for interviews, and optimize your job application. What would you like help with today?",
      timestamp: new Date().toISOString(),
    };

    let messages = [welcomeMessage];
    
    if (resumeText) {
      const contextMessage: Message = {
        id: '2',
        role: 'assistant',
        content: "I have access to your most recent resume. I can help you improve it, suggest better ways to present your experience, or help you tailor it for specific job opportunities. What would you like to focus on?",
        timestamp: new Date().toISOString(),
      };
      
      messages = [...messages, contextMessage];
    }

    setMessages(messages);

    // Save the new chat to the database
    if (user) {
      try {
        const { error } = await supabase
          .from('ai_coach_sessions')
          .upsert({
            user_id: user.id,
            messages,
            resume_text: resumeText,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error saving new chat:', error);
        toast({
          title: "Error",
          description: "Failed to start new chat",
          variant: "destructive",
        });
      }
    }
  };

  // Show loading state while auth and subscription are being checked
  if (isAuthLoading || isSubscriptionLoading) {
    return (
      <Card className="w-full h-[calc(100vh-12rem)] flex flex-col">
        <CardContent className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // Show paywall if not authenticated or no access
  if (!user || !canAccessAICoach) {
    return (
      <Card className="w-full h-[calc(100vh-12rem)] flex flex-col">
        <CardContent className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-6">
            <Lock className="h-12 w-12 text-scanmatch-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Pro Feature</h2>
            <p className="text-gray-600 mb-4">
              {!user 
                ? "Sign in to access the AI Resume Coach and other premium features."
                : "Upgrade to Pro or Premium to unlock the AI Resume Coach and get personalized resume advice."}
            </p>
          </div>
          <div className="flex flex-col space-y-3 w-full max-w-xs">
            {!user ? (
              <>
                <Button className="bg-scanmatch-600 hover:bg-scanmatch-700" asChild>
                  <a href="/signup">Sign Up</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/login">Login</a>
                </Button>
              </>
            ) : (
              <Button className="bg-scanmatch-600 hover:bg-scanmatch-700" asChild>
                <a href="/pricing">Upgrade to Pro</a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[calc(100vh-12rem)] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            AI Resume Coach
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={startNewChat}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            New Chat
          </Button>
        </div>
        <CardDescription>
          Get personalized resume advice and job application tips
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden flex flex-col">
        <div className="flex-grow overflow-y-auto mb-4 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${
                message.role === 'user' ? 'ml-auto' : ''
              }`}
            >
              <div
                className={`p-3 rounded-lg max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-scanmatch-500 text-white ml-auto'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center mb-1">
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 mr-1" />
                  ) : (
                    <Bot className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-xs font-medium">
                    {message.role === 'user' ? 'You' : 'AI Coach'}
                  </span>
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
              <div
                className={`text-xs text-gray-400 mt-1 ${
                  message.role === 'user' ? 'text-right' : ''
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Suggestion buttons */}
        {messages.length < 3 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Not sure what to ask? Try one of these:</p>
            <div className="flex flex-wrap gap-2">
              {["How do I highlight transferable skills?", "Help me write a strong summary section", "How should I list my education with no experience?"].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    setInput(suggestion);
                  }}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Feature highlights */}
        {messages.length === 1 && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-scanmatch-50 p-3 rounded-lg flex items-start">
              <GraduationCap className="h-5 w-5 text-scanmatch-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Resume Writing</h4>
                <p className="text-xs text-gray-600">Get help writing effective resume sections</p>
              </div>
            </div>
            <div className="bg-scanmatch-50 p-3 rounded-lg flex items-start">
              <BookOpen className="h-5 w-5 text-scanmatch-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Interview Prep</h4>
                <p className="text-xs text-gray-600">Practice answering common questions</p>
              </div>
            </div>
            <div className="bg-scanmatch-50 p-3 rounded-lg flex items-start">
              <FileText className="h-5 w-5 text-scanmatch-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Cover Letters</h4>
                <p className="text-xs text-gray-600">Get help drafting compelling cover letters</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-grow"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="bg-scanmatch-600 hover:bg-scanmatch-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default AIResumeCoach;
