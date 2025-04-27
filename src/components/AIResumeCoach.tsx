/** @jsxImportSource react */
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bot, Send, Lock, Sparkles, User, Loader2, GraduationCap, BookOpen, FileText } from 'lucide-react';

type Message = {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
};

const AIResumeCoach = () => {
  const { user } = useAuth();
  const { tier, canAccessAICoach } = useSubscription();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [resumeText, setResumeText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with welcome message and fetch resume
    if (isInitializing && user) {
      setIsInitializing(false);
      
      // Fetch chat history and resume
      const initializeChat = async () => {
        try {
          // Fetch most recent resume
          const { data: resumeData, error: resumeError } = await supabase
            .from('resume_analyses')
            .select('resume_text')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (resumeError) throw resumeError;
          if (resumeData?.resume_text) {
            setResumeText(resumeData.resume_text);
          }

          // Fetch chat history
          const { data: chatData, error: chatError } = await supabase
            .from('ai_coach_sessions')
            .select('messages')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (chatError && chatError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            throw chatError;
          }

          if (chatData?.messages) {
            setMessages(chatData.messages);
          } else {
            // No existing chat, start with welcome message
            const welcomeMessage: Message = {
              id: '1',
              role: 'system',
              content: "Hello! I'm your AI Resume Coach. I can help you improve your resume, prepare for interviews, and optimize your job application. What would you like help with today?",
              timestamp: new Date().toISOString(),
            };
            
            setMessages([welcomeMessage]);

            if (resumeData?.resume_text) {
              // Add message about having access to resume
              const contextMessage: Message = {
                id: '2',
                role: 'system',
                content: "I have access to your most recent resume. I can help you improve it, suggest better ways to present your experience, or help you tailor it for specific job opportunities. What would you like to focus on?",
                timestamp: new Date().toISOString(),
              };
              
              setMessages(prev => [...prev, contextMessage]);
            }
          }
        } catch (error) {
          console.error('Error initializing chat:', error);
          toast({
            title: "Error",
            description: "Failed to load chat history",
            variant: "destructive",
          });
        }
      };

      initializeChat();
    }
  }, [isInitializing, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Suggestion buttons for common questions
  const suggestionButtons = [
    "How do I highlight transferable skills?",
    "Help me write a strong summary section",
    "How should I list my education with no experience?",
  ];

  const handleSubmit = async (e: React.FormEvent, suggestedInput?: string) => {
    e.preventDefault();
    
    const messageContent = suggestedInput || input;
    if (!messageContent.trim()) return;
    
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to use the AI Resume Coach",
        variant: "destructive",
      });
      return;
    }
    
    if (!canAccessAICoach) {
      toast({
        title: "Pro Feature",
        description: "AI Resume Coach is available to Pro subscribers",
        variant: "destructive",
      });
      return;
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-resume-coach', {
        body: { 
          message: messageContent,
          userId: user.id,
          resumeText: resumeText
        },
      });
      
      if (error) throw error;
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || "I'm sorry, I couldn't process your request. Please try again.",
        timestamp: new Date().toISOString(),
      };
      
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Save the entire conversation to the database
      const { error: saveError } = await supabase
        .from('ai_coach_sessions')
        .upsert({
          user_id: user.id,
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

  const startNewChat = async () => {
    const welcomeMessage: Message = {
      id: '1',
      role: 'system',
      content: "Hello! I'm your AI Resume Coach. I can help you improve your resume, prepare for interviews, and optimize your job application. What would you like help with today?",
      timestamp: new Date().toISOString(),
    };

    setMessages([welcomeMessage]);

    if (resumeText) {
      const contextMessage: Message = {
        id: '2',
        role: 'system',
        content: "I have access to your most recent resume. I can help you improve it, suggest better ways to present your experience, or help you tailor it for specific job opportunities. What would you like to focus on?",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, contextMessage]);
    }

    // Save the new chat to the database
    if (user) {
      try {
        const { error } = await supabase
          .from('ai_coach_sessions')
          .upsert({
            user_id: user.id,
            messages: resumeText ? [welcomeMessage, contextMessage] : [welcomeMessage],
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
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
  
  if (!user) {
    return (
      <Card className="h-full flex flex-col">
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
        <CardContent className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Lock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="font-medium text-lg mb-2">Please Log In</h3>
            <p className="text-gray-500 mb-4">
              You need to be logged in to use the AI Resume Coach
            </p>
            <Button className="bg-scanmatch-600 hover:bg-scanmatch-700" asChild>
              <a href="/login">Log In</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!canAccessAICoach) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            AI Resume Coach
          </CardTitle>
          <CardDescription>
            Get personalized resume advice and job application tips
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="h-12 w-12 mx-auto text-amber-400 mb-4" />
            <h3 className="font-medium text-lg mb-2">Pro Feature</h3>
            <p className="text-gray-500 mb-4">
              Upgrade to the Pro plan to unlock the AI Resume Coach
            </p>
            <Button 
              className="bg-scanmatch-600 hover:bg-scanmatch-700"
              onClick={() => window.location.href = '/pricing'}
            >
              Upgrade to Pro
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full flex flex-col">
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
                    : message.role === 'system'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <div className="flex items-center mb-1">
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 mr-1" />
                  ) : (
                    <Bot className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-xs font-medium">
                    {message.role === 'user'
                      ? 'You'
                      : message.role === 'system'
                      ? 'AI Coach'
                      : 'AI Coach'}
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
              {suggestionButtons.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={(e) => handleSubmit(e, suggestion)}
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
      <CardFooter>
        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <Input
            placeholder="Ask about resume improvements, interview tips, or job search advice..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
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
