import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from "@/lib/supabaseClient";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import QuestionTypeSelector from '@/components/interview/QuestionTypeSelector';
import PracticeQuestion from '@/components/interview/PracticeQuestion';
import AnswerInput from '@/components/interview/AnswerInput';
import FeedbackDisplay from '@/components/interview/FeedbackDisplay';
import ProgressTracker from '@/components/ProgressTracker';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";

// Import interview questions and feedback templates
import { INTERVIEW_QUESTIONS, FEEDBACK_TEMPLATES } from '@/lib/interviewData';

const Interview = () => {
  const [questionType, setQuestionType] = useState('behavioral');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const { user } = useAuth();
  const subscription = useSubscription();
  const navigate = useNavigate();
  
  const generateQuestion = () => {
    // Get a random question from the appropriate category
    const questions = INTERVIEW_QUESTIONS[questionType];
    const randomIndex = Math.floor(Math.random() * questions.length);
    setCurrentQuestion(questions[randomIndex]);
    setAnswer('');
    setFeedback('');
    setPracticeMode(true);
  };
  
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error("Please enter your answer before submitting");
      return;
    }
    
    setIsLoading(true);
    
    // Check if user has premium access for AI coach
    const canAccessAICoach = subscription?.tier === 'premium';
    
    try {
      if (canAccessAICoach && user) {
        // Real AI feedback using edge function
        const { data, error } = await supabase.functions.invoke('ai-resume-coach', {
          body: { 
            message: `I need feedback on my interview response. Here's the question: "${currentQuestion}". And here's my answer: "${answer}". Please provide constructive feedback on my response, including strengths and specific areas for improvement. Format your response as bullet points.`
          },
        });
        
        if (error) throw new Error(error.message);
        
        setFeedback(data.message || "No feedback received");
      } else {
        // Mock feedback for non-premium users
        const feedbacks = FEEDBACK_TEMPLATES[questionType];
        const randomIndex = Math.floor(Math.random() * feedbacks.length);
        
        // Add some delay to simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setFeedback(`
• ${feedbacks[randomIndex]}

• Your answer is clear and structured, which is excellent for interview responses.

• Consider adding more specific examples to strengthen your answer.

• Great job addressing the main question. To improve further, connect your experience directly to the potential employer's needs.

*To access more detailed AI-powered feedback, upgrade to Premium.*
        `);
      }
      
      // Add to practice history
      setPracticeHistory(prev => [
        { question: currentQuestion, answer, type: questionType },
        ...prev
      ].slice(0, 5));
      
    } catch (err) {
      console.error("Error getting feedback:", err);
      toast.error("Failed to get feedback", {
        description: "Please try again later",
      });
      setFeedback("We couldn't generate feedback at this time. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const startNewQuestion = () => {
    setPracticeMode(false);
    setCurrentQuestion('');
    setAnswer('');
    setFeedback('');
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };
  
  // Check if user needs to upgrade for full access
  const needsUpgrade = !user || (user && subscription?.tier !== 'premium');
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow py-12">
        <div className="container-custom">
          <ProgressTracker currentStep="interview" className="mb-8 animate-in fade-in-50" />
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">Interview Practice</h1>
            <p className="text-gray-600 mt-2">Practice smarter, not harder with AI-powered interview preparation</p>
          </div>
          
          {needsUpgrade && (
            <Card className="mb-8 bg-gradient-to-r from-scanmatch-50 to-blue-50 border-scanmatch-100">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-10 w-10 text-scanmatch-600 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold">Upgrade for Advanced Interview Coaching</h3>
                      <p className="text-gray-600">Premium users get detailed AI feedback and unlimited practice sessions</p>
                    </div>
                  </div>
                  <Button className="bg-scanmatch-600 hover:bg-scanmatch-700" asChild>
                    <Link to="/pricing">Upgrade Now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {!practiceMode ? (
            <QuestionTypeSelector 
              questionType={questionType}
              setQuestionType={setQuestionType}
              generateQuestion={generateQuestion}
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <PracticeQuestion
                  questionType={questionType}
                  currentQuestion={currentQuestion}
                  startNewQuestion={startNewQuestion}
                  onCopy={copyToClipboard}
                />
                
                <AnswerInput
                  answer={answer}
                  setAnswer={setAnswer}
                  handleSubmitAnswer={handleSubmitAnswer}
                  isLoading={isLoading}
                />
              </div>
              
              <div className="space-y-6">
                <FeedbackDisplay
                  feedback={feedback}
                  onCopy={copyToClipboard}
                />
                
                {practiceHistory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Practice History</CardTitle>
                      <CardDescription>Your recent practice questions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        {practiceHistory.map((item, index) => (
                          <li key={index} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                            <div className="flex items-start gap-2 mb-1">
                              <Badge variant="outline" className="shrink-0">
                                {item.type === 'technical' ? 'Technical' : 
                                 item.type === 'behavioral' ? 'Behavioral' : 'Resume-Based'}
                              </Badge>
                              <p className="font-medium">{item.question}</p>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{item.answer}</p>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-3">Success Tips</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="bg-scanmatch-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stars className="h-6 w-6 text-scanmatch-700" />
                </div>
                <h3 className="font-semibold mb-2">Use the STAR Method</h3>
                <p className="text-sm text-gray-600">
                  Structure your answers with Situation, Task, Action, and Result for behavioral questions.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="bg-scanmatch-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-6 w-6 text-scanmatch-700" />
                </div>
                <h3 className="font-semibold mb-2">Research the Company</h3>
                <p className="text-sm text-gray-600">
                  Show your interest by connecting your answers to the company's values and needs.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="bg-scanmatch-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-6 w-6 text-scanmatch-700" />
                </div>
                <h3 className="font-semibold mb-2">Practice Consistently</h3>
                <p className="text-sm text-gray-600">
                  Regular practice builds confidence. Aim to practice at least 3 questions per day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Interview;
