import React, { useState, useEffect } from 'react';
import ProgressTracker from "@/components/ProgressTracker";
import AICoachAvatar from "@/components/AICoachAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/sonner";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Loader2, MessageSquare, CheckCircle2, XCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import InterviewQAHistory from "@/components/InterviewQAHistory";
import ReactMarkdown from 'react-markdown';

interface QuestionAttempt {
  id: string;
  user_answer: string;
  ai_feedback: string;
  created_at: string;
}

interface InterviewQuestion {
  question: string;
  context: string;
  type: 'technical' | 'behavioral' | 'resume_based';
  attempts?: QuestionAttempt[];
}

interface InterviewQA {
  id: string;
  question: string;
  context: string;
  user_answer: string;
  ai_feedback: string;
  type: 'technical' | 'behavioral' | 'resume_based';
}

interface PracticeSession {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface ResumeAnalysisSummary {
  id: string;
  job_title: string;
  created_at: string;
  interview_questions?: {
    technical: Array<{ question: string; context: string }>;
    behavioral: Array<{ question: string; context: string }>;
    resume_based: Array<{ question: string; context: string }>;
  };
}

const Interview = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentTab, setCurrentTab] = useState<'technical' | 'behavioral' | 'resume_based'>('technical');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qaHistory, setQaHistory] = useState<InterviewQA[]>([]);
  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>([]);
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [analyses, setAnalyses] = useState<ResumeAnalysisSummary[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('');
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(false);
  const [questionAttempts, setQuestionAttempts] = useState<Record<string, QuestionAttempt[]>>({});
  const [showPreviousAttempts, setShowPreviousAttempts] = useState(false);
  const [currentAttemptIndex, setCurrentAttemptIndex] = useState(0);
  const [feedback, setFeedback] = useState<string>('');

  // Define filteredQuestions before useEffect
  const filteredQuestions = questions.filter(q => q.type === currentTab);

  useEffect(() => {
    if (user) {
      loadResumeAnalyses();
    } else {
      loadQuestionsFromLocalStorage();
    }
  }, [user]);

  useEffect(() => {
    if (selectedAnalysisId) {
      loadQuestionAttempts(selectedAnalysisId);
    }
  }, [selectedAnalysisId, currentTab]);

  const loadResumeAnalyses = async () => {
    setIsLoadingAnalyses(true);
    try {
      const { data, error } = await supabase
        .from('resume_analyses')
        .select('id, job_title, created_at, interview_questions')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAnalyses(data || []);
      if (data && data.length > 0) {
        setSelectedAnalysisId(data[0].id);
        loadQuestionsFromAnalysis(data[0]);
      }
    } catch (error) {
      console.error('Error loading resume analyses:', error);
      toast({
        title: "Error",
        description: "Failed to load your resume analyses",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAnalyses(false);
    }
  };

  const loadQuestionsFromLocalStorage = () => {
    try {
      const analysisData = localStorage.getItem('resumeAnalysis');
      if (analysisData) {
        const analysis = JSON.parse(analysisData);
        if (analysis.interview_questions) {
          const questions = [
            ...analysis.interview_questions.technical.map(q => ({ ...q, type: 'technical' as const })),
            ...analysis.interview_questions.behavioral.map(q => ({ ...q, type: 'behavioral' as const })),
            ...analysis.interview_questions.resume_based.map(q => ({ ...q, type: 'resume_based' as const }))
          ];
          setQuestions(questions);
          
          // Load attempts from localStorage
          const storedAttempts = JSON.parse(localStorage.getItem('interviewAttempts') || '{}');
          setQuestionAttempts(storedAttempts);
          
          // If there are attempts for the current question, show the most recent one
          const currentQuestion = questions[currentQuestionIndex];
          if (currentQuestion && storedAttempts[currentQuestion.question]?.length > 0) {
            setCurrentAttemptIndex(0);
            setUserAnswer(storedAttempts[currentQuestion.question][0].user_answer);
            setShowFeedback(true);
            setFeedback(storedAttempts[currentQuestion.question][0].ai_feedback);
          }
        }
      }
    } catch (error) {
      console.error('Error loading questions from localStorage:', error);
      toast({
        title: "Error",
        description: "Failed to load interview questions",
        variant: "destructive",
      });
    }
  };

  const loadQuestionsFromAnalysis = (analysis: ResumeAnalysisSummary) => {
    if (analysis.interview_questions) {
      const questions = [
        ...analysis.interview_questions.technical.map(q => ({ ...q, type: 'technical' as const })),
        ...analysis.interview_questions.behavioral.map(q => ({ ...q, type: 'behavioral' as const })),
        ...analysis.interview_questions.resume_based.map(q => ({ ...q, type: 'resume_based' as const }))
      ];
      setQuestions(questions);
      setCurrentQuestionIndex(0);
      setShowFeedback(false);
      setUserAnswer('');
      if (selectedAnalysisId) {
        loadQuestionAttempts(selectedAnalysisId);
      }
    }
  };

  const loadQuestionAttempts = async (analysisId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('interview_qa')
        .select('*')
        .eq('analysis_id', analysisId)
        .eq('question_type', currentTab)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const attempts = (data || []).reduce((acc: Record<string, QuestionAttempt[]>, qa) => {
        if (!acc[qa.question]) {
          acc[qa.question] = [];
        }
        acc[qa.question].push({
          id: qa.id,
          user_answer: qa.user_answer,
          ai_feedback: qa.ai_feedback,
          created_at: qa.created_at,
        });
        return acc;
      }, {});

      setQuestionAttempts(attempts);

      // Always show the most recent attempt if available
      const currentQuestion = filteredQuestions[currentQuestionIndex]?.question;
      if (currentQuestion && attempts[currentQuestion]?.length > 0) {
        setCurrentAttemptIndex(0);
        setUserAnswer(attempts[currentQuestion][0].user_answer);
        setShowFeedback(true);
        setFeedback(attempts[currentQuestion][0].ai_feedback);
      } else {
        setCurrentAttemptIndex(0);
        setUserAnswer('');
        setShowFeedback(false);
        setFeedback('');
      }
    } catch (error) {
      console.error('Error loading question attempts:', error);
      toast({
        title: "Error",
        description: "Failed to load previous attempts",
        variant: "destructive",
      });
    }
  };

  const handleAnalysisChange = async (analysisId: string) => {
    setSelectedAnalysisId(analysisId);
    const analysis = analyses.find(a => a.id === analysisId);
    if (analysis) {
      loadQuestionsFromAnalysis(analysis);
      await loadQuestionAttempts(analysisId);
    }
  };

  const loadPracticeSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('interview_practice_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPracticeSessions(data || []);
    } catch (error) {
      console.error('Error loading practice sessions:', error);
    }
  };

  const createPracticeSession = async () => {
    try {
      const { data, error } = await supabase
        .from('interview_practice_sessions')
        .insert([
          {
            user_id: user?.id,
            title: 'New Practice Session',
            description: 'Practice session created on ' + new Date().toLocaleDateString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;
      setCurrentSession(data);
      setPracticeSessions([data, ...practiceSessions]);
    } catch (error) {
      console.error('Error creating practice session:', error);
      toast({
        title: "Error",
        description: "Failed to create practice session",
        variant: "destructive",
      });
    }
  };

  const saveQA = async () => {
    if (!currentSession) return;

    try {
      const { data, error } = await supabase
        .from('interview_qa')
        .insert([
          {
            session_id: currentSession.id,
            question_type: currentTab,
            question: questions[currentQuestionIndex].question,
            context: questions[currentQuestionIndex].context,
            user_answer: userAnswer,
            ai_feedback: qaHistory[qaHistory.length - 1]?.ai_feedback || '',
          }
        ])
        .select()
        .single();

      if (error) throw error;
      setQaHistory([...qaHistory, data]);
      toast({
        title: "Success",
        description: "Question and answer saved to your practice bank",
      });
    } catch (error) {
      console.error('Error saving Q&A:', error);
      toast({
        title: "Error",
        description: "Failed to save question and answer",
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (value: 'technical' | 'behavioral' | 'resume_based') => {
    setCurrentTab(value);
    setCurrentQuestionIndex(0);
    setShowFeedback(false);
    setUserAnswer('');
    setCurrentAttemptIndex(0);
    
    // Filter questions for the new tab
    const filtered = questions.filter(q => q.type === value);
    if (filtered.length > 0) {
      setCurrentQuestionIndex(0);
      if (selectedAnalysisId) {
        loadQuestionAttempts(selectedAnalysisId);
      }
    }
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      toast({
        title: "Error",
        description: "Please enter your answer before submitting",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const currentQuestion = filteredQuestions[currentQuestionIndex];
      if (!currentQuestion) {
        throw new Error('No question selected');
      }

      // Call the GPT function for feedback
      const { data: feedbackData, error: feedbackError } = await supabase.functions.invoke('interview-feedback', {
        body: {
          question: currentQuestion.question,
          answer: userAnswer,
          context: currentQuestion.context,
          question_type: currentTab
        }
      });

      if (feedbackError) throw feedbackError;

      // Create a new attempt object
      const newAttempt = {
        id: Date.now().toString(), // Temporary ID for local state
        user_answer: userAnswer,
        ai_feedback: feedbackData.feedback,
        created_at: new Date().toISOString()
      };

      // Update the attempts for the current question
      const currentQuestionKey = currentQuestion.question;
      const updatedAttempts = [newAttempt, ...(questionAttempts[currentQuestionKey] || [])];
      
      // Update state
      setQuestionAttempts(prev => ({
        ...prev,
        [currentQuestionKey]: updatedAttempts
      }));

      // Save to localStorage if user is not signed in
      if (!user) {
        const storedAttempts = JSON.parse(localStorage.getItem('interviewAttempts') || '{}');
        storedAttempts[currentQuestionKey] = updatedAttempts;
        localStorage.setItem('interviewAttempts', JSON.stringify(storedAttempts));
      }

      // Set the current attempt to the new one
      setCurrentAttemptIndex(0);
      setShowFeedback(true);
      setFeedback(feedbackData.feedback);

      // Only save to database if we have a valid analysis_id
      if (selectedAnalysisId) {
        const { error: insertError } = await supabase
          .from('interview_qa')
          .insert({
            analysis_id: selectedAnalysisId,
            question: currentQuestion.question,
            context: currentQuestion.context,
            user_answer: userAnswer,
            ai_feedback: feedbackData.feedback,
            question_type: currentTab
          });

        if (insertError) throw insertError;

        // Reload attempts to show the new one
        await loadQuestionAttempts(selectedAnalysisId);
      }

      toast({
        title: "Success",
        description: "Feedback generated successfully",
      });
    } catch (err) {
      console.error('Error generating feedback:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate feedback');
      toast({
        title: "Error",
        description: "Failed to generate feedback",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add useEffect to load attempts from localStorage when component mounts
  useEffect(() => {
    if (!user) {
      const storedAttempts = JSON.parse(localStorage.getItem('interviewAttempts') || '{}');
      setQuestionAttempts(storedAttempts);
      
      // If there are attempts for the current question, show the most recent one
      const currentQuestion = filteredQuestions[currentQuestionIndex];
      if (currentQuestion && storedAttempts[currentQuestion.question]?.length > 0) {
        setCurrentAttemptIndex(0);
        setUserAnswer(storedAttempts[currentQuestion.question][0].user_answer);
        setShowFeedback(true);
        setFeedback(storedAttempts[currentQuestion.question][0].ai_feedback);
      }
    }
  }, [user, currentQuestionIndex, filteredQuestions]);

  const handleTryAgain = () => {
    setUserAnswer('');
    setShowFeedback(false);
  };

  const handleRetryAttempt = (attempt) => {
    setUserAnswer(attempt.user_answer);
    setShowFeedback(false);
  };

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const currentQuestionAttempts = currentQuestion 
    ? questionAttempts[currentQuestion.question] || []
    : [];

  const handleQuestionClick = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowFeedback(false);
    setUserAnswer('');
    setCurrentAttemptIndex(0);
    
    if (selectedAnalysisId) {
      loadQuestionAttempts(selectedAnalysisId);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <main className="flex-grow container-custom py-8">
        <ProgressTracker currentStep="interview" className="mb-6" />
          <div className="mb-8">
          <AICoachAvatar message="Ready for your practice session? I'll give feedback and motivation as you answer!" />
        </div>
        {user && (
          <div className="flex items-center gap-4 mb-8 animate-fade-in">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{user.email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
              <AvatarImage />
            </Avatar>
            <div>
              <p className="font-bold text-base">Hi, {user.email}! Ready for your interview practice?</p>
              <p className="text-scanmatch-700 text-xs">Progress anytime. You can always jump between Resume, Interview, and Learn step above.</p>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <Card className="shadow-sm border-0">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Interview Practice</CardTitle>
                <CardDescription className="text-base">Pick a question, answer in any order!</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={currentTab} onValueChange={(value) => handleTabChange(value as typeof currentTab)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6 p-1 bg-gray-100 rounded-lg">
                    <TabsTrigger value="technical" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition hover-scale">Technical</TabsTrigger>
                    <TabsTrigger value="behavioral" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition hover-scale">Behavioral</TabsTrigger>
                    <TabsTrigger value="resume_based" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition hover-scale">Resume</TabsTrigger>
                  </TabsList>
                  <ScrollArea className="h-[calc(100vh-400px)]">
                    <div className="space-y-2 pr-4">
                      {filteredQuestions.map((q, index) => (
                        <Button
                          key={index}
                          variant={currentQuestionIndex === index ? "default" : "ghost"}
                          className={`w-full justify-start text-left py-4 px-4 h-auto whitespace-pre-line break-words ${currentQuestionIndex === index ? 'bg-scanmatch-50 text-scanmatch-900 pulse' : 'hover:bg-gray-50'}`}
                          style={{ whiteSpace: 'pre-line', wordBreak: 'break-word', minHeight: 64, maxHeight: 90 }}
                          onClick={() => handleQuestionClick(index)}
                        >
                          <span className="line-clamp-3 text-sm font-medium">{q.question}</span>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-8">
            <Card className="shadow-sm border-0">
              <CardHeader className="space-y-4 pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">
                    Question {currentQuestionIndex + 1} of {filteredQuestions.length}
                  </CardTitle>
                  <span className="text-sm px-3 py-1 bg-scanmatch-50 text-scanmatch-700 rounded-full">
                    {currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}
                  </span>
              </div>
                {filteredQuestions[currentQuestionIndex]?.context && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <CardDescription className="text-blue-700 text-sm leading-relaxed">
                      {filteredQuestions[currentQuestionIndex].context}
                    </CardDescription>
                            </div>
                )}
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Question:</h3>
                  <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line animate-fade-in">
                    {filteredQuestions[currentQuestionIndex]?.question}
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Your Answer:</h3>
                  <Textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="min-h-[200px] text-base resize-none focus:ring-2 focus:ring-scanmatch-200"
                    disabled={showFeedback && currentQuestionAttempts.length > 0}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentQuestionIndex((prev) => (prev + 1) % filteredQuestions.length);
                      setShowFeedback(false);
                      setUserAnswer('');
                      setCurrentAttemptIndex(0);
                    }}
                  >
                    Skip
                  </Button>
                  {showFeedback && currentQuestionAttempts.length > 0 ? (
                    <Button
                      onClick={handleTryAgain}
                      className="bg-scanmatch-600 hover:bg-scanmatch-700 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      New Attempt
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading || !userAnswer.trim()}
                      className="bg-scanmatch-600 hover:bg-scanmatch-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Getting Feedback...
                        </>
                      ) : (
                        'Submit Answer'
                      )}
                    </Button>
                  )}
                </div>
                {currentQuestionAttempts.length > 0 && (
                  <div className="mt-6 border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Previous Attempts</h3>
                      <Select
                        value={currentAttemptIndex.toString()}
                        onValueChange={(value) => {
                          const index = parseInt(value);
                          setCurrentAttemptIndex(index);
                          setUserAnswer(currentQuestionAttempts[index].user_answer);
                          setShowFeedback(true);
                        }}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select an attempt" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentQuestionAttempts.map((attempt, index) => {
                            const attemptNumber = currentQuestionAttempts.length - index;
                            return (
                              <SelectItem 
                                key={attempt.id} 
                                value={index.toString()}
                              >
                                Attempt {attemptNumber} - {new Date(attempt.created_at).toLocaleDateString()}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                {showFeedback && (
                  <div className="mt-6 border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">AI Feedback</h3>
                      {currentQuestionAttempts.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleTryAgain}
                          className="text-scanmatch-600 hover:text-scanmatch-700 flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          New Attempt
                        </Button>
                      )}
                    </div>
                    <div className="bg-gradient-to-br from-white to-scanmatch-50 rounded-xl border border-scanmatch-200 shadow-lg overflow-hidden">
                      <div className="p-6 space-y-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-scanmatch-100 to-scanmatch-200 flex items-center justify-center shadow-sm">
                              <MessageSquare className="h-5 w-5 text-scanmatch-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="prose prose-scanmatch max-w-none">
                              <ReactMarkdown
                                components={{
                                  p: ({ node, ...props }) => (
                                    <p className="text-gray-700 leading-relaxed mb-4 last:mb-0" {...props} />
                                  ),
                                  ul: ({ node, ...props }) => (
                                    <ul className="list-disc pl-6 mb-4 last:mb-0 space-y-2" {...props} />
                                  ),
                                  ol: ({ node, ...props }) => (
                                    <ol className="list-decimal pl-6 mb-4 last:mb-0 space-y-2" {...props} />
                                  ),
                                  li: ({ node, ...props }) => (
                                    <li className="text-gray-700 leading-relaxed" {...props} />
                                  ),
                                  h1: ({ node, ...props }) => (
                                    <h1 className="text-2xl font-bold text-scanmatch-900 mb-4 last:mb-0" {...props} />
                                  ),
                                  h2: ({ node, ...props }) => (
                                    <h2 className="text-xl font-semibold text-scanmatch-800 mb-3 last:mb-0" {...props} />
                                  ),
                                  h3: ({ node, ...props }) => (
                                    <h3 className="text-lg font-semibold text-scanmatch-700 mb-3 last:mb-0" {...props} />
                                  ),
                                  blockquote: ({ node, ...props }) => (
                                    <blockquote className="border-l-4 border-scanmatch-300 pl-4 italic my-4 bg-scanmatch-50/50 p-3 rounded-r-lg" {...props} />
                                  ),
                                  code: ({ node, ...props }) => (
                                    <code className="bg-scanmatch-100 text-scanmatch-700 rounded px-2 py-1 text-sm font-mono" {...props} />
                                  ),
                                  strong: ({ node, ...props }) => (
                                    <strong className="text-scanmatch-700 font-semibold" {...props} />
                                  ),
                                  em: ({ node, ...props }) => (
                                    <em className="text-scanmatch-600 italic" {...props} />
                                  ),
                                }}
                              >
                                {currentQuestionAttempts[currentAttemptIndex]?.ai_feedback}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
              </div>
            </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Interview;
