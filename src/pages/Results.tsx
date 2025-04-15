import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FileText, Download, ChevronLeft, ChevronRight, Trophy, Award, AlertTriangle } from "lucide-react";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResumeViewer from '@/components/ResumeViewer';
import { useAuth } from "@/hooks/useAuth";
import { getResumeAnalysis } from "@/lib/supabaseClient";
import { useSubscription } from '@/hooks/useSubscription';
import AIResumeCoach from '@/components/AIResumeCoach';
import { toast } from "@/components/ui/sonner";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier, canAccessAICoach } = useSubscription();
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      
      try {
        const params = new URLSearchParams(location.search);
        const analysisId = params.get('id');
        
        if (analysisId && user) {
          const analysis = await getResumeAnalysis(analysisId);
          setAnalysis(analysis);
          
          const storedResumeText = sessionStorage.getItem('resumeText') || '';
          const storedJobDesc = sessionStorage.getItem('jobDescription') || '';
          setResumeText(storedResumeText);
          setJobDescription(storedJobDesc);
        } else {
          const storedAnalysis = sessionStorage.getItem('resumeAnalysis');
          if (storedAnalysis) {
            setAnalysis(JSON.parse(storedAnalysis));
            
            const storedResumeText = sessionStorage.getItem('resumeText') || '';
            const storedJobDesc = sessionStorage.getItem('jobDescription') || '';
            setResumeText(storedResumeText);
            setJobDescription(storedJobDesc);
          } else {
            navigate('/scan');
            return;
          }
        }
      } catch (error) {
        console.error("Error fetching analysis:", error);
        toast.error("Couldn't load your analysis", {
          description: "Please try scanning your resume again",
        });
        navigate('/scan');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalysis();
  }, [location.search, user, navigate]);
  
  if (isLoading || !analysis) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow py-12 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 w-full max-w-3xl bg-gray-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const parseJsonField = (field: any) => {
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch (e) {
        return [];
      }
    }
    return field || [];
  };
  
  const keywordsFound = parseJsonField(analysis.keywords_found);
  const keywordsMissing = parseJsonField(analysis.keywords_missing);
  const structureStrengths = parseJsonField(analysis.structure_strengths);
  const structureImprovements = parseJsonField(analysis.structure_improvements);
  const improvementSuggestions = parseJsonField(analysis.improvement_suggestions);
  
  const percentScore = Math.round(analysis.score);
  
  let scoreMessage = '';
  let scoreColorClass = '';
  
  if (percentScore >= 80) {
    scoreMessage = "Excellent! Your resume is well-matched for this job.";
    scoreColorClass = "text-green-600";
  } else if (percentScore >= 60) {
    scoreMessage = "Good! With a few adjustments, your resume will be even better.";
    scoreColorClass = "text-amber-600";
  } else {
    scoreMessage = "Your resume needs some work to better match this job.";
    scoreColorClass = "text-red-600";
  }
  
  const encouragementMessage = percentScore >= 70 
    ? "You're almost there! Your resume shows great potential even with limited experience." 
    : "Don't worry! Everyone starts somewhere. Let's make your experience shine!";
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow py-12">
        <div className="container-custom">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/scan">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Scan
                </Link>
              </Button>
              
              <div className="text-xs text-gray-500 flex items-center">
                <span className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center mr-1">1</span>
                Upload
                <ChevronRight className="h-4 w-4 mx-1" />
                <span className="bg-scanmatch-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-1">2</span>
                Results
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-1">Resume Analysis Results</h1>
            <p className="text-gray-600">
              {analysis.job_title 
                ? `For ${analysis.job_title} position` 
                : 'Job match analysis'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 text-scanmatch-600 mr-2" />
                  Match Score
                </CardTitle>
                <CardDescription>How well your resume matches the job</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="relative">
                    <svg className="w-32 h-32" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e6e6e6"
                        strokeWidth="3"
                        strokeDasharray="100, 100"
                      />
                      <path
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={percentScore >= 80 ? "#4ade80" : percentScore >= 60 ? "#fbbf24" : "#f87171"}
                        strokeWidth="3"
                        strokeDasharray={`${percentScore}, 100`}
                        className="animate-scoreCircle"
                      />
                      <text x="18" y="20.5" textAnchor="middle" className="text-3xl font-bold">
                        {percentScore}
                      </text>
                    </svg>
                  </div>
                  <p className={`mt-4 text-center font-medium ${scoreColorClass}`}>{scoreMessage}</p>
                  <p className="mt-2 text-sm text-center text-gray-600">{encouragementMessage}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Keywords Analysis</CardTitle>
                <CardDescription>Important terms found in your resume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Found Keywords</span>
                      <span className="text-xs text-gray-500">{Array.isArray(keywordsFound) ? keywordsFound.length : 0} found</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(keywordsFound) && keywordsFound.length > 0 ? (
                        keywordsFound.slice(0, 8).map((keyword, index) => (
                          <span 
                            key={index} 
                            className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                          >
                            {typeof keyword === 'string' ? keyword : keyword.word}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No keywords found</span>
                      )}
                      {Array.isArray(keywordsFound) && keywordsFound.length > 8 && (
                        <span className="text-xs text-scanmatch-600">+{keywordsFound.length - 8} more</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Missing Keywords</span>
                      <span className="text-xs text-gray-500">{Array.isArray(keywordsMissing) ? keywordsMissing.length : 0} missing</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(keywordsMissing) && keywordsMissing.length > 0 ? (
                        keywordsMissing.slice(0, 8).map((keyword, index) => (
                          <span 
                            key={index} 
                            className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded"
                          >
                            {typeof keyword === 'string' ? keyword : keyword.word}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No missing keywords</span>
                      )}
                      {Array.isArray(keywordsMissing) && keywordsMissing.length > 8 && (
                        <span className="text-xs text-scanmatch-600">+{keywordsMissing.length - 8} more</span>
                      )}
                    </div>
                  </div>
                  
                  {percentScore < 80 && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded p-3">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">
                          You're missing {keywordsMissing.length} important keywords. Try adding them to improve your match!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Resume Structure</CardTitle>
                <CardDescription>Strengths and areas for improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <Award className="h-4 w-4 text-scanmatch-600 mr-1" />
                      Strengths
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      {structureStrengths.map((strength: string, index: number) => (
                        <li key={index} className="text-gray-700">{strength}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <Award className="h-4 w-4 text-amber-500 mr-1" />
                      Improvements
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      {structureImprovements.map((improvement: string, index: number) => (
                        <li key={index} className="text-gray-700">{improvement}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <ResumeViewer
                resumeText={resumeText}
                jobDescription={jobDescription}
                keywordsFound={keywordsFound}
                keywordsMissing={keywordsMissing}
              />
            </div>
            
            <div className="lg:col-span-1">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 text-scanmatch-600 mr-2" />
                    AI Resume Coach
                  </CardTitle>
                  <CardDescription>
                    Get personalized advice to improve your resume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm">
                      Our AI Coach can help you optimize your resume for this job. It can provide tailored advice on:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Better framing your academic or non-traditional experience</li>
                      <li>Emphasizing your transferable skills effectively</li>
                      <li>Addressing the missing keywords and requirements</li>
                    </ul>
                    
                    <Button 
                      className="w-full bg-scanmatch-600 hover:bg-scanmatch-700"
                      asChild
                    >
                      <Link to="/ai-coach">
                        Get Personal Resume Advice
                      </Link>
                    </Button>
                    
                    {!user && (
                      <p className="text-xs text-gray-500 text-center">
                        Log in to access the AI Resume Coach
                      </p>
                    )}
                    
                    {user && tier === 'free' && (
                      <p className="text-xs text-gray-500 text-center">
                        Upgrade to Pro to access the AI Resume Coach
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mb-8">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Improvement Suggestions</CardTitle>
                <CardDescription>
                  Actionable steps to enhance your resume for this job
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {improvementSuggestions.length > 0 ? (
                    improvementSuggestions.map((suggestion: string, index: number) => (
                      <div key={index} className="p-3 border rounded bg-scanmatch-50">
                        <p className="text-gray-700">{suggestion}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No specific improvement suggestions available.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" className="flex items-center" asChild>
              <Link to="/scan">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Scan Another Resume
              </Link>
            </Button>
            
            <Button className="bg-scanmatch-600 hover:bg-scanmatch-700" size="lg" asChild>
              <Link to="/ai-coach">
                Get AI Resume Coaching
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Results;
