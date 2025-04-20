import React, { useState, useEffect } from 'react';
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
import { Loader2, MessageSquare, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

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
  const [qaHistory, setQaHistory] = useState<InterviewQA[]>([]);
  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>([]);
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [analyses, setAnalyses] = useState<ResumeAnalysisSummary[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('');
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(false);
  const [questionAttempts, setQuestionAttempts] = useState<Record<string, QuestionAttempt[]>>({});
  const [showPreviousAttempts, setShowPreviousAttempts] = useState(false);

  useEffect(() => {
    if (user) {
      loadResumeAnalyses();
    } else {
      loadQuestionsFromLocalStorage();
    }
  }, [user]);

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
    }
  };

  const loadQuestionAttempts = async (analysisId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('interview_qa')
        .select('*')
        .eq('analysis_id', analysisId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group attempts by question
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
    } catch (error) {
      console.error('Error loading question attempts:', error);
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

  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      toast({
        title: "Error",
        description: "Please provide an answer before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: functionError } = await supabase.functions.invoke('interview-feedback', {
        body: {
          question: questions[currentQuestionIndex].question,
          answer: userAnswer,
          context: questions[currentQuestionIndex].context,
          qa_history: qaHistory,
        },
      });

      if (functionError || !data) {
        throw new Error(functionError?.message || 'Failed to get feedback');
      }

      // Save to database if user is logged in
      if (user && selectedAnalysisId) {
        const { error: saveError } = await supabase
          .from('interview_qa')
          .insert({
            analysis_id: selectedAnalysisId,
            question: questions[currentQuestionIndex].question,
            context: questions[currentQuestionIndex].context,
            user_answer: userAnswer,
            ai_feedback: data.feedback,
            question_type: currentTab,
          });

        if (saveError) throw saveError;

        // Update local state
        const currentQuestion = questions[currentQuestionIndex].question;
        setQuestionAttempts(prev => ({
          ...prev,
          [currentQuestion]: [
            ...(prev[currentQuestion] || []),
            {
              id: Date.now().toString(),
              user_answer: userAnswer,
              ai_feedback: data.feedback,
              created_at: new Date().toISOString(),
            },
          ],
        }));
      }

      setQaHistory([
        ...qaHistory,
        {
          id: Date.now().toString(),
          question: questions[currentQuestionIndex].question,
          context: questions[currentQuestionIndex].context,
          user_answer: userAnswer,
          ai_feedback: data.feedback,
          type: currentTab,
        },
      ]);
      setShowFeedback(true);
    } catch (error) {
      console.error('Error getting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to get AI feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setUserAnswer('');
    setShowFeedback(false);
  };

  const currentQuestionAttempts = questions[currentQuestionIndex]
    ? questionAttempts[questions[currentQuestionIndex].question] || []
    : [];

  const filteredQuestions = questions.filter(q => q.type === currentTab);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <main className="flex-grow container-custom py-8">
        {user && (
          <div className="mb-6">
            <Card className="shadow-sm border-0">
              <CardContent className="pt-6">
                <Select
                  value={selectedAnalysisId}
                  onValueChange={handleAnalysisChange}
                  disabled={isLoadingAnalyses}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select a resume analysis" />
                  </SelectTrigger>
                  <SelectContent>
                    {analyses.map((analysis) => (
                      <SelectItem key={analysis.id} value={analysis.id}>
                        {analysis.job_title} - {new Date(analysis.created_at).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-4">
            <Card className="shadow-sm border-0">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Interview Practice</CardTitle>
                <CardDescription className="text-base">Select a question type to begin</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as typeof currentTab)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6 p-1 bg-gray-100 rounded-lg">
                    <TabsTrigger value="technical" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Technical</TabsTrigger>
                    <TabsTrigger value="behavioral" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Behavioral</TabsTrigger>
                    <TabsTrigger value="resume_based" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Resume</TabsTrigger>
                  </TabsList>
                  
                  <ScrollArea className="h-[calc(100vh-400px)]">
                    <div className="space-y-2 pr-4">
                      {filteredQuestions.map((q, index) => (
                        <Button
                          key={index}
                          variant={currentQuestionIndex === index ? "default" : "ghost"}
                          className={`w-full justify-start text-left py-4 px-4 h-auto ${
                            currentQuestionIndex === index 
                              ? 'bg-scanmatch-50 text-scanmatch-900 hover:bg-scanmatch-100' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            setCurrentQuestionIndex(index);
                            setShowFeedback(false);
                            setUserAnswer('');
                          }}
                        >
                          <span className="line-clamp-2 text-sm">{q.question}</span>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
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
                {questions[currentQuestionIndex]?.context && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <CardDescription className="text-blue-700 text-sm leading-relaxed">
                      {questions[currentQuestionIndex].context}
                    </CardDescription>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Question:</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {questions[currentQuestionIndex]?.question}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Your Answer:</h3>
                  <Textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="min-h-[200px] text-base resize-none focus:ring-2 focus:ring-scanmatch-200"
                  />
                </div>

                {showFeedback && currentQuestionAttempts.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Previous Attempts</h3>
                      <Button
                        variant="ghost"
                        onClick={() => setShowPreviousAttempts(!showPreviousAttempts)}
                      >
                        {showPreviousAttempts ? 'Hide' : 'Show'} History
                      </Button>
                    </div>

                    {showPreviousAttempts && (
                      <div className="space-y-4">
                        {currentQuestionAttempts.map((attempt, index) => (
                          <Card key={attempt.id} className="bg-gray-50">
                            <CardHeader>
                              <CardTitle className="text-sm font-medium">
                                Attempt {index + 1} - {new Date(attempt.created_at).toLocaleDateString()}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Your Answer:</h4>
                                <p className="text-gray-700">{attempt.user_answer}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Feedback:</h4>
                                <p className="text-gray-700 whitespace-pre-wrap">{attempt.ai_feedback}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentQuestionIndex((prev) => (prev + 1) % filteredQuestions.length);
                      setShowFeedback(false);
                      setUserAnswer('');
                    }}
                  >
                    Skip
                  </Button>
                  {showFeedback ? (
                    <Button
                      onClick={handleTryAgain}
                      className="bg-scanmatch-600 hover:bg-scanmatch-700"
                    >
                      Try Again
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
