
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FileText, ChevronLeft, ChevronRight, GraduationCap, Briefcase } from "lucide-react";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ResumeViewer from '@/components/ResumeViewer';
import { useAuth } from "@/hooks/useAuth";
import { getResumeAnalysis } from "@/lib/supabaseClient";
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import AICoachPreview from '@/components/AICoachPreview';
import MatchScoreCard from '@/components/MatchScoreCard';
import KeywordAnalysisCard from '@/components/KeywordAnalysisCard';
import ResumeStructureCard from '@/components/ResumeStructureCard';
import SaveResumeCard from '@/components/SaveResumeCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

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
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {analysis.job_title && (
                <div className="text-gray-700 flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" /> 
                  {analysis.job_title}
                  {isEntryLevel && (
                    <span className="ml-2">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">Entry-Level</Badge>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {!user && <SaveResumeCard />}
          
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
                  <AICoachPreview />
                  
                  <Button 
                    className="w-full mt-4 bg-scanmatch-600 hover:bg-scanmatch-700"
                    asChild
                  >
                    <Link to="/ai-coach">
                      Get Personal Resume Advice
                    </Link>
                  </Button>
                  
                  {!user && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Log in to access the AI Resume Coach
                    </p>
                  )}
                  
                  {user && tier === 'free' && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Upgrade to Pro to access the AI Resume Coach
                    </p>
                  )}
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
                  {improvementSuggestions && improvementSuggestions.length > 0 ? (
                    improvementSuggestions.map((suggestion: string, index: number) => (
                      <div key={index} className="p-3 border rounded bg-scanmatch-50">
                        <p className="text-gray-700">{suggestion}</p>
                        <div className="mt-2 flex justify-end">
                          <Button variant="outline" size="sm" className="text-xs">
                            Rewrite for me
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No specific improvement suggestions available.</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <div className="text-center">
                  <p className="text-sm font-medium mb-2">📤 Want a rewritten resume?</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/ai-coach">Try our rewrite assistant</Link>
                  </Button>
                </div>
              </CardFooter>
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
