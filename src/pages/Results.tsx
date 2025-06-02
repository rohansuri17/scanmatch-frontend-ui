import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FileText, ChevronLeft, ChevronRight, GraduationCap, Briefcase, Sparkles, CheckCircle } from "lucide-react";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ResumeViewer from '@/components/ResumeViewer';
import { useAuth } from "@/hooks/useAuth";
import { getResumeAnalysis } from "@/lib/supabaseClient";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import AICoachPreview from '@/components/AICoachPreview';
import MatchScoreCard from '@/components/MatchScoreCard';
import KeywordAnalysisCard from '@/components/KeywordAnalysisCard';
import ResumeStructureCard from '@/components/ResumeStructureCard';
import SaveResumeCard from '@/components/SaveResumeCard';
import ImprovementSuggestionsCard from '@/components/ImprovementSuggestionsCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import ProgressTracker from '@/components/ProgressTracker';
import NextStepCard from '@/components/NextStepCard';
import ResumeRewriteButton from '@/components/ResumeRewriteButton';
import { supabase } from "@/lib/supabaseClient";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier, canAccessAICoach } = useSubscription();
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      
      try {
        const params = new URLSearchParams(location.search);
        const analysisId = params.get('id');
        
        if (analysisId && user) {
          setAnalysisId(analysisId);
          const analysis = await getResumeAnalysis(analysisId);
          setAnalysis(analysis);
          setResumeText(analysis.resume_text || '');
          setJobDescription(analysis.job_description || '');
          
          // Store the analysis data in localStorage for Learn page
          localStorage.setItem('resumeAnalysis', JSON.stringify(analysis));
        } else {
          // For non-logged in users, check localStorage
          const cachedAnalysis = localStorage.getItem('resumeAnalysis');
          if (cachedAnalysis) {
            const parsedAnalysis = JSON.parse(cachedAnalysis);
            setAnalysis(parsedAnalysis);
            setResumeText(parsedAnalysis.resume_text || '');
            setJobDescription(parsedAnalysis.job_description || '');
          } else {
            // If no cached analysis, redirect to scan page
            navigate('/scan');
          }
        }
      } catch (error) {
        console.error('Error fetching analysis:', error);
        toast.error('Failed to load analysis');
        navigate('/scan');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalysis();
  }, [user, location.search, navigate]);
  
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
    if (!field) return [];
    
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch (e) {
        console.log("Failed to parse JSON field:", field, e);
        return [field];
      }
    }
    
    if (Array.isArray(field)) {
      return field;
    }
    
    if (field && typeof field === 'object') {
      if (field.found) return field.found;
      if (field.missing) return field.missing;
      
      return Object.values(field);
    }
    
    return [];
  };
  
  const hasKeywordsObject = analysis && 
    analysis.keywords && 
    (Array.isArray(analysis.keywords.found) || Array.isArray(analysis.keywords.missing));
  
  const keywordsFound = hasKeywordsObject
    ? parseJsonField(analysis.keywords?.found)
    : parseJsonField(analysis.keywords_found);
  
  const keywordsMissing = hasKeywordsObject
    ? parseJsonField(analysis.keywords?.missing)
    : parseJsonField(analysis.keywords_missing);
  
  const hasStructureObject = analysis && 
    analysis.structure && 
    (Array.isArray(analysis.structure.strengths) || Array.isArray(analysis.structure.improvements));
  
  const structureStrengths = hasStructureObject
    ? parseJsonField(analysis.structure?.strengths)
    : parseJsonField(analysis.structure_strengths);
  
  const structureImprovements = hasStructureObject
    ? parseJsonField(analysis.structure?.improvements)
    : parseJsonField(analysis.structure_improvements);
  
  const improvementSuggestions = parseJsonField(analysis.improvement_suggestions);
  
  console.log("Parsed data:", {
    keywordsFound,
    keywordsMissing,
    structureStrengths,
    structureImprovements
  });
  
  const percentScore = Math.round(analysis.score);
  
  const isEntryLevel = analysis.job_title?.toLowerCase().includes('junior') || 
                      analysis.job_title?.toLowerCase().includes('entry') || 
                      analysis.job_title?.toLowerCase().includes('intern') || 
                      analysis.job_title?.toLowerCase().includes('graduate');
  
  const redirectToAICoach = () => {
    sessionStorage.setItem('coachResumeText', resumeText);
    sessionStorage.setItem('coachJobDescription', jobDescription);
    navigate('/ai-coach');
  };

  const redirectToLearn = () => {
    // Store the complete analysis object in localStorage
    console.log('Storing analysis in localStorage:', analysis);
    localStorage.setItem('resumeAnalysis', JSON.stringify(analysis));
    
    // Verify the data was stored correctly
    const storedData = localStorage.getItem('resumeAnalysis');
    console.log('Stored data in localStorage:', storedData);
    
    navigate('/learn');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow py-12">
        <div className="container-custom">
          <ProgressTracker currentStep="resume" className="mb-8 animate-in fade-in-50" />
          
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/scan">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Scan
                </Link>
              </Button>
            </div>
          </div>
          
          {!user && <SaveResumeCard />}
          
          <Card className="mb-8 border-scanmatch-200 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-6">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-scanmatch-600" />
                    Premium Resume Rewrite
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Get your resume professionally rewritten by AI for just $7
                  </CardDescription>
                </div>
                <ResumeRewriteButton
                  resumeText={resumeText}
                  jobDescription={jobDescription}
                  analysisData={analysis}
                />
              </div>
            </CardHeader>
          </Card>
          
          {isEntryLevel && (
            <Card className="bg-blue-50 border-blue-200 shadow-sm p-4 mb-8">
              <div className="flex items-start">
                <GraduationCap className="h-5 w-5 text-blue-700 mr-3 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Tips for New Grads & Career Switchers</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    <li>Frame academic projects like real-world experience</li>
                    <li>Emphasize transferable skills like teamwork and adaptability</li>
                    <li>Show enthusiasm and initiative over job history</li>
                    <li>Highlight relevant coursework and technical skills</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <MatchScoreCard score={percentScore} />
            <KeywordAnalysisCard 
              keywordsFound={keywordsFound} 
              keywordsMissing={keywordsMissing} 
              score={percentScore}
            />
            <ResumeStructureCard 
              structureStrengths={structureStrengths} 
              structureImprovements={structureImprovements}
            />
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
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-xl">Next Steps</CardTitle>
                  <CardDescription>Continue your journey to job success</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-scanmatch-100 p-2 rounded-full">
                      <GraduationCap className="h-5 w-5 text-scanmatch-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Personalized Learning Path</h3>
                      <p className="text-sm text-gray-600">Get custom course recommendations based on your analysis</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-scanmatch-100 p-2 rounded-full">
                      <Briefcase className="h-5 w-5 text-scanmatch-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Interview Preparation</h3>
                      <p className="text-sm text-gray-600">Practice with AI-generated questions tailored to your resume</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button 
                    className="w-full bg-scanmatch-600 hover:bg-scanmatch-700" 
                    onClick={redirectToLearn}
                  >
                    Continue to Learning Path
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  {canAccessAICoach && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={redirectToAICoach}
                    >
                      Get AI Resume Coach Help
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
          
          <ImprovementSuggestionsCard 
              suggestions={improvementSuggestions} 
              redirectToAICoach={redirectToAICoach} 
              canAccess={canAccessAICoach} 
            />

          {tier === 'premium' && (
            <div className="mb-8">
              <Card className="shadow-md border-amber-300">
                <CardHeader className="bg-amber-50">
                  <CardTitle className="text-amber-800">Premium Feature: Human Recruiter Review</CardTitle>
                  <CardDescription className="text-amber-700">
                    Get your resume reviewed by an experienced recruiter
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-800 mb-4">
                    Our recruiters will provide detailed feedback on your resume and help you optimize it for your target role.
                  </p>
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    Request Recruiter Review
                    </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Results;
