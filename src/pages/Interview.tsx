
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowRight, 
  MessageSquare, 
  Send, 
  Loader2, 
  ThumbsUp, 
  ThumbsDown, 
  User, 
  Copy, 
  Briefcase, 
  Lightbulb, 
  Brain, 
  CheckCircle2, 
  Stars,
  Code,
  FileText
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from "@/integrations/supabase/client";

// Mock interview questions data
const INTERVIEW_QUESTIONS = {
  technical: [
    "What is the difference between var, let, and const in JavaScript?",
    "Explain how React's virtual DOM works",
    "What is the time complexity of searching in a hash table?",
    "How would you optimize a slow SQL query?",
    "Explain the differences between REST and GraphQL APIs"
  ],
  behavioral: [
    "Tell me about a time when you had to deal with a challenging team member",
    "Describe a situation where you had to learn a new skill quickly",
    "How do you prioritize your work when dealing with multiple deadlines?",
    "Give an example of a project you're particularly proud of",
    "Tell me about a time you received critical feedback and how you responded"
  ],
  resumeBased: [
    "I see you worked on a project using React. What was the most challenging aspect of it?",
    "You mentioned leadership experience in your resume. Can you elaborate on your leadership style?",
    "Your resume indicates you have experience with data analysis. What tools do you use and why?",
    "Tell me more about this gap in your employment history",
    "I noticed you changed career paths. What motivated that decision?"
  ]
};

const FEEDBACK_TEMPLATES = {
  technical: [
    "Your answer demonstrates good technical understanding. Consider adding more specific examples of implementation details.",
    "Great explanation of the concepts. To improve, try connecting your technical knowledge to real-world applications.",
    "You've covered the basics well. Consider discussing potential trade-offs or alternative approaches to show depth of knowledge."
  ],
  behavioral: [
    "Strong response using the STAR method. Your example clearly illustrated the situation, task, action, and result.",
    "Good reflection on your experience. Try to highlight more about what you learned from this situation.",
    "Effective communication of your approach. Consider quantifying the impact or results of your actions more explicitly."
  ],
  resumeBased: [
    "Your answer aligns well with your resume experience. To strengthen it further, connect this experience to the role you're applying for.",
    "Good elaboration on your resume information. Consider adding more specifics about your direct contributions.",
    "Nice job contextualizing your resume experience. For even stronger impact, mention measurable outcomes of your work."
  ]
};

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
            <Card>
              <CardHeader>
                <CardTitle>Select Question Type</CardTitle>
                <CardDescription>Choose the type of interview questions you want to practice</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={questionType} onValueChange={setQuestionType} className="w-full">
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="technical">Technical</TabsTrigger>
                    <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
                    <TabsTrigger value="resumeBased">Resume-Based</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="technical">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-scanmatch-100 p-2 rounded-full">
                          <Code className="h-5 w-5 text-scanmatch-700" />
                        </div>
                        <div>
                          <h3 className="font-medium">Technical Questions</h3>
                          <p className="text-gray-600 text-sm">Practice answering questions about programming, algorithms, and technical concepts relevant to your field.</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium mb-2">Example Questions:</p>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 mt-0.5 text-scanmatch-600 flex-shrink-0" />
                            <span>Explain the concept of Object-Oriented Programming</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 mt-0.5 text-scanmatch-600 flex-shrink-0" />
                            <span>What's the difference between HTTP and HTTPS?</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 mt-0.5 text-scanmatch-600 flex-shrink-0" />
                            <span>Describe your experience with SQL databases</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="behavioral">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-scanmatch-100 p-2 rounded-full">
                          <User className="h-5 w-5 text-scanmatch-700" />
                        </div>
                        <div>
                          <h3 className="font-medium">Behavioral Questions</h3>
                          <p className="text-gray-600 text-sm">Practice answering questions about your past experiences, teamwork, conflict resolution, and other soft skills.</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium mb-2">Example Questions:</p>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 mt-0.5 text-scanmatch-600 flex-shrink-0" />
                            <span>Tell me about a time you faced a challenge at work</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 mt-0.5 text-scanmatch-600 flex-shrink-0" />
                            <span>How do you handle tight deadlines?</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 mt-0.5 text-scanmatch-600 flex-shrink-0" />
                            <span>Describe a situation where you showed leadership</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="resumeBased">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-scanmatch-100 p-2 rounded-full">
                          <FileText className="h-5 w-5 text-scanmatch-700" />
                        </div>
                        <div>
                          <h3 className="font-medium">Resume-Based Questions</h3>
                          <p className="text-gray-600 text-sm">Practice answering questions specifically about your resume, past experience, and qualifications.</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium mb-2">Example Questions:</p>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 mt-0.5 text-scanmatch-600 flex-shrink-0" />
                            <span>Tell me more about your role at [Company X]</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 mt-0.5 text-scanmatch-600 flex-shrink-0" />
                            <span>I see you have experience with [Skill Y]. Can you elaborate?</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 mt-0.5 text-scanmatch-600 flex-shrink-0" />
                            <span>Why did you transition from [Previous Role] to [Current Role]?</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={generateQuestion} 
                  className="bg-scanmatch-600 hover:bg-scanmatch-700 w-full md:w-auto"
                >
                  Generate Question <Lightbulb className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <Badge className="w-fit mb-2">
                      {questionType === 'technical' ? 'Technical' : 
                       questionType === 'behavioral' ? 'Behavioral' : 'Resume-Based'}
                    </Badge>
                    <CardTitle className="text-xl">Question</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">{currentQuestion}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={startNewQuestion}>
                      New Question
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(currentQuestion)}
                    >
                      <Copy className="h-4 w-4 mr-1" /> Copy
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Your Answer</CardTitle>
                    <CardDescription>Type your response as if you were in an interview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Enter your answer here..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="min-h-[200px]"
                    />
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleSubmitAnswer} 
                      disabled={isLoading || !answer.trim()} 
                      className="w-full bg-scanmatch-600 hover:bg-scanmatch-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Getting Feedback...
                        </>
                      ) : (
                        <>
                          Submit Answer <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card className={feedback ? "bg-scanmatch-50 border-scanmatch-100" : ""}>
                  <CardHeader>
                    <CardTitle className="text-xl">AI Feedback</CardTitle>
                    <CardDescription>
                      {feedback ? "Here's what our AI coach thinks of your answer" : "Submit your answer to get feedback"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {feedback ? (
                      <div className="whitespace-pre-line text-gray-800">
                        {feedback}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Brain className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p>AI feedback will appear here after you submit your answer</p>
                      </div>
                    )}
                  </CardContent>
                  {feedback && (
                    <CardFooter className="flex justify-between">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <ThumbsUp className="h-4 w-4 mr-1" /> Helpful
                        </Button>
                        <Button variant="outline" size="sm">
                          <ThumbsDown className="h-4 w-4 mr-1" /> Not Helpful
                        </Button>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(feedback)}
                      >
                        <Copy className="h-4 w-4 mr-1" /> Copy
                      </Button>
                    </CardFooter>
                  )}
                </Card>
                
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
